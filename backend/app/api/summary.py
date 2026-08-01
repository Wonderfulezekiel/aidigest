from fastapi import APIRouter, HTTPException
try:
    from app.database import supabase, safe_execute
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.get("/{doc_id}")
async def get_summary(doc_id: str):
    res = safe_execute(supabase.table("summaries").select("*").eq("document_id", doc_id), fallback=[])
    if res:
        return res[0]

    doc_res = safe_execute(supabase.table("documents").select("*").eq("id", doc_id), fallback=[])
    if not doc_res:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = doc_res[0]
    chunks = safe_execute(supabase.table("document_chunks").select("chunk_text").eq("document_id", doc_id).limit(10), fallback=[])
    text_content = "\n".join([c["chunk_text"] for c in chunks]) if chunks else doc["title"]

    summary_data = await ai_service.generate_summary(doc["title"], text_content)

    summary_record = {
        "document_id": doc_id,
        "short_summary": summary_data.get("short_summary", ""),
        "detailed_summary": summary_data.get("detailed_summary", ""),
        "key_topics": summary_data.get("key_topics", []),
        "important_concepts": summary_data.get("important_concepts", []),
        "definitions": summary_data.get("definitions", []),
        "main_ideas": summary_data.get("main_ideas", []),
        "conclusion": summary_data.get("conclusion", ""),
    }

    safe_execute(supabase.table("summaries").insert(summary_record))
    return summary_record
