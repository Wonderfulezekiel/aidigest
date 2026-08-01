from fastapi import APIRouter, HTTPException
from app.database import supabase

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.get("/{doc_id}")
async def get_summary(doc_id: str):
    res = supabase.table("summaries").select("*").eq("document_id", doc_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Summary not found for this document")
    return res.data[0]
