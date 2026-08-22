import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
try:
    from app.database import supabase, safe_execute
    from app.services.embedding_service import embedding_service
    from app.services.pinecone_service import pinecone_service
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.services.embedding_service import embedding_service
    from backend.app.services.pinecone_service import pinecone_service
    from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/chat", tags=["chat"])

class SendMessageRequest(BaseModel):
    conversation_id: str
    message: str

@router.get("/history")
async def list_conversations():
    try:
        conversations = safe_execute(supabase.table("conversations").select("*").order("created_at", desc=True), fallback=[])

        for conv in conversations:
            msg_res = safe_execute(supabase.table("messages").select("*").eq("conversation_id", conv["id"]).order("created_at", desc=False), fallback=[])
            conv["messages"] = msg_res
            doc_res = safe_execute(supabase.table("documents").select("title").eq("id", conv["document_id"]), fallback=[])
            if doc_res:
                conv["document_title"] = doc_res[0]["title"]
            else:
                conv["document_title"] = "Academic PDF"

        return conversations
    except Exception as e:
        print(f"[Chat] History notice: {e}")
        return []

@router.get("/document/{doc_id}")
async def get_or_create_conversation(doc_id: str):
    try:
        # Check if conversation exists
        res = safe_execute(supabase.table("conversations").select("*").eq("document_id", doc_id).limit(1), fallback=[])
        if res:
            conv = res[0]
            msg_res = safe_execute(supabase.table("messages").select("*").eq("conversation_id", conv["id"]).order("created_at", desc=False), fallback=[])
            conv["messages"] = msg_res
            doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
            conv["document_title"] = doc_res[0]["title"] if doc_res else "Academic PDF"
            return conv

        # Create new conversation session
        doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
        doc_title = doc_res[0]["title"] if doc_res else "Academic PDF"

        conv_id = str(uuid.uuid4())
        conv_record = {
            "id": conv_id,
            "document_id": doc_id,
            "title": f"Discussion on {doc_title}",
        }
        safe_execute(supabase.table("conversations").insert(conv_record))

        welcome_msg = {
            "id": str(uuid.uuid4()),
            "conversation_id": conv_id,
            "role": "assistant",
            "message": f"Hello! I've analyzed **\"{doc_title}\"**. What would you like to ask or explore about this document?",
            "citations": [],
        }
        safe_execute(supabase.table("messages").insert(welcome_msg))

        conv_record["messages"] = [welcome_msg]
        conv_record["document_title"] = doc_title
        return conv_record
    except Exception as e:
        print(f"[Chat] get_or_create_conversation notice: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send")
async def send_message(req: SendMessageRequest):
    conv_res = safe_execute(supabase.table("conversations").select("*").eq("id", req.conversation_id), fallback=[])
    if not conv_res:
        raise HTTPException(status_code=404, detail="Conversation session not found")

    conv = conv_res[0]
    doc_id = conv["document_id"]

    doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
    doc_title = doc_res[0]["title"] if doc_res else "Academic PDF"

    # 1. Save user message to Supabase
    user_msg_record = {
        "id": str(uuid.uuid4()),
        "conversation_id": req.conversation_id,
        "role": "user",
        "message": req.message,
    }
    safe_execute(supabase.table("messages").insert(user_msg_record))

    # 2. Deep Context Retrieval: Vectorize Question & Query Pinecone (top 6 chunks)
    retrieved_chunks = []
    try:
        query_vector = await embedding_service.generate_embedding(req.message)
        retrieved_chunks = await pinecone_service.query_similar_chunks(query_vector, doc_id, top_k=6)
    except Exception as e:
        print(f"[Chat] RAG vector query notice: {e}")

    # Fallback or Augment with direct document chunks from database
    if len(retrieved_chunks) < 3:
        chunk_db_res = safe_execute(supabase.table("document_chunks").select("*").eq("document_id", doc_id).limit(6), fallback=[])
        if chunk_db_res:
            db_chunks = [
                {
                    "page_number": c.get("page_number", c.get("chunk_index", 0) + 1),
                    "chunk_text": c.get("chunk_text", ""),
                }
                for c in chunk_db_res
            ]
            retrieved_chunks.extend(db_chunks)

    # Deduplicate retrieved chunks
    seen_texts = set()
    unique_chunks = []
    for c in retrieved_chunks:
        t = c.get("chunk_text", "").strip()
        if t and t not in seen_texts:
            seen_texts.add(t)
            unique_chunks.append(c)

    # 3. Generate High-Insight AI Answer
    rag_output = await ai_service.generate_rag_answer(req.message, doc_title, unique_chunks[:6])

    # 4. Save AI Response to Supabase
    ai_msg_record = {
        "id": str(uuid.uuid4()),
        "conversation_id": req.conversation_id,
        "role": "assistant",
        "message": rag_output.get("message", "Here is the response for your query."),
        "citations": rag_output.get("citations", []),
    }
    safe_execute(supabase.table("messages").insert(ai_msg_record))

    return ai_msg_record

@router.delete("/{conv_id}")
async def delete_conversation(conv_id: str):
    safe_execute(supabase.table("conversations").delete().eq("id", conv_id))
    return {"message": "Conversation deleted successfully", "id": conv_id}

@router.delete("/clear/all")
async def clear_all_conversations():
    safe_execute(supabase.table("conversations").delete().neq("id", "00000000-0000-0000-0000-000000000000"))
    return {"message": "All chat history cleared"}
