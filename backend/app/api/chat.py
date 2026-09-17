import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

try:
    from app.database import supabase, safe_execute
    from app.services.embedding_service import embedding_service
    from app.services.pinecone_service import pinecone_service
    from app.services.ai_service import ai_service
    from app.api.deps import get_current_user
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.services.embedding_service import embedding_service
    from backend.app.services.pinecone_service import pinecone_service
    from backend.app.services.ai_service import ai_service
    from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

class SendMessageRequest(BaseModel):
    conversation_id: str
    message: str

@router.get("/history")
async def list_conversations(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        conversations = safe_execute(
            supabase.table("conversations").select("*").eq("user_id", user_id).order("created_at", desc=True),
            fallback=[]
        )

        for conv in conversations:
            msg_res = safe_execute(
                supabase.table("messages").select("*").eq("conversation_id", conv["id"]).order("created_at", desc=False),
                fallback=[]
            )
            conv["messages"] = msg_res
            doc_res = safe_execute(
                supabase.table("documents").select("title").eq("id", conv["document_id"]),
                fallback=[]
            )
            if doc_res:
                conv["document_title"] = doc_res[0]["title"]
            else:
                conv["document_title"] = "Academic PDF"

        return conversations
    except Exception as e:
        print(f"[Chat] History notice: {e}")
        return []

@router.get("/document/{doc_id}")
async def get_or_create_conversation(doc_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        # Check if conversation exists for this user and document
        res = safe_execute(
            supabase.table("conversations").select("*").eq("document_id", doc_id).eq("user_id", user_id).limit(1),
            fallback=[]
        )
        if res:
            conv = res[0]
            msg_res = safe_execute(
                supabase.table("messages").select("*").eq("conversation_id", conv["id"]).order("created_at", desc=False),
                fallback=[]
            )
            conv["messages"] = msg_res
            doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
            conv["document_title"] = doc_res[0]["title"] if doc_res else "Academic PDF"
            return conv

        # Create new conversation session for this user
        doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
        doc_title = doc_res[0]["title"] if doc_res else "Academic PDF"

        conv_id = str(uuid.uuid4())
        conv_record = {
            "id": conv_id,
            "document_id": doc_id,
            "user_id": user_id,
            "title": f"Study Chat: {doc_title}",
        }
        safe_execute(supabase.table("conversations").insert(conv_record), fallback=[conv_record])

        # Welcome message
        welcome_id = str(uuid.uuid4())
        welcome_msg = {
            "id": welcome_id,
            "conversation_id": conv_id,
            "role": "assistant",
            "message": f"Hello! I have thoroughly analyzed **{doc_title}**. What concept, formula, or section would you like me to explain?",
            "citations": [],
        }
        safe_execute(supabase.table("messages").insert(welcome_msg), fallback=[welcome_msg])

        return {
            "id": conv_id,
            "document_id": doc_id,
            "user_id": user_id,
            "document_title": doc_title,
            "title": f"Study Chat: {doc_title}",
            "messages": [welcome_msg],
        }
    except Exception as e:
        print(f"[Chat] Create conversation notice: {e}")
        return {
            "id": "conv-fallback",
            "document_id": doc_id,
            "user_id": user_id,
            "document_title": "Academic PDF",
            "title": "Study Chat",
            "messages": [],
        }

@router.post("/send")
async def send_message(req: SendMessageRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]

    # 1. Fetch conversation details
    conv_data = safe_execute(supabase.table("conversations").select("*").eq("id", req.conversation_id), fallback=[])
    if not conv_data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    doc_id = conv_data[0]["document_id"]
    doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
    doc_title = doc_res[0]["title"] if doc_res else "Academic Document"

    # 2. Save user message to database
    user_msg_id = str(uuid.uuid4())
    user_msg = {
        "id": user_msg_id,
        "conversation_id": req.conversation_id,
        "role": "user",
        "message": req.message,
    }
    safe_execute(supabase.table("messages").insert(user_msg))

    # 3. Vector Search (RAG)
    relevant_chunks = []
    citations = []

    try:
        q_emb = await embedding_service.generate_embedding(req.message)
        matches = await pinecone_service.query_similar(q_emb, top_k=6, document_id=doc_id)
        
        for m in matches:
            meta = m.get("metadata", {})
            chunk_txt = meta.get("chunk_text")
            page_no = meta.get("page_number", 1)
            if chunk_txt and chunk_txt not in relevant_chunks:
                relevant_chunks.append(chunk_txt)
                citations.append({"page": page_no, "snippet": chunk_txt[:200] + "..."})
    except Exception as e:
        print(f"[Chat] Pinecone RAG notice: {e}")

    # Fallback to database chunks if Pinecone returned few results
    if len(relevant_chunks) < 2:
        try:
            db_chunks = safe_execute(
                supabase.table("document_chunks").select("chunk_text").eq("document_id", doc_id).limit(4),
                fallback=[]
            )
            for idx, c in enumerate(db_chunks):
                if c["chunk_text"] not in relevant_chunks:
                    relevant_chunks.append(c["chunk_text"])
                    citations.append({"page": idx + 1, "snippet": c["chunk_text"][:200] + "..."})
        except Exception as e:
            print(f"[Chat] DB chunk fallback notice: {e}")

    # 4. Generate AI response with academic tutor grounding
    context = "\n\n---\n\n".join(relevant_chunks)
    ai_reply_text = await ai_service.chat_with_document(doc_title, context, req.message)

    # 5. Save AI response
    ai_msg_id = str(uuid.uuid4())
    ai_msg = {
        "id": ai_msg_id,
        "conversation_id": req.conversation_id,
        "role": "assistant",
        "message": ai_reply_text,
        "citations": citations[:4],
    }
    safe_execute(supabase.table("messages").insert(ai_msg))

    return {
        "id": ai_msg_id,
        "conversation_id": req.conversation_id,
        "role": "assistant",
        "message": ai_reply_text,
        "citations": citations[:4],
    }

@router.delete("/{conv_id}")
async def delete_conversation(conv_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    safe_execute(supabase.table("messages").delete().eq("conversation_id", conv_id))
    safe_execute(supabase.table("conversations").delete().eq("id", conv_id).eq("user_id", user_id))
    return {"message": "Conversation deleted successfully", "id": conv_id}

@router.delete("/clear/all")
async def clear_all_conversations(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    convs = safe_execute(supabase.table("conversations").select("id").eq("user_id", user_id), fallback=[])
    for c in convs:
        safe_execute(supabase.table("messages").delete().eq("conversation_id", c["id"]))
    safe_execute(supabase.table("conversations").delete().eq("user_id", user_id))
    return {"message": "All conversations cleared successfully"}
