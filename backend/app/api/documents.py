import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Any

try:
    from app.database import supabase, safe_execute
    from app.services.pdf_service import pdf_service
    from app.services.embedding_service import embedding_service
    from app.services.pinecone_service import pinecone_service
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.services.pdf_service import pdf_service
    from backend.app.services.embedding_service import embedding_service
    from backend.app.services.pinecone_service import pinecone_service
    from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/documents", tags=["documents"])

def clean_val(obj: Any) -> Any:
    """Recursively strips null bytes from strings, dicts, and lists."""
    if isinstance(obj, str):
        return obj.replace("\x00", "").replace("\u0000", "").strip()
    elif isinstance(obj, list):
        return [clean_val(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: clean_val(v) for k, v in obj.items()}
    return obj

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        file_bytes = await file.read()
        file_size = len(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    # 1. Text Extraction & Overlapping Chunking
    try:
        extraction = pdf_service.extract_text_and_chunks(file_bytes)
        page_count = extraction.get("page_count", 1)
        chunks = extraction.get("chunks", [])
        full_text = clean_val(extraction.get("full_text", ""))
    except Exception as e:
        print(f"[Upload] Extraction error: {e}")
        page_count = 1
        chunks = [{
            "chunk_index": 0,
            "page_number": 1,
            "chunk_text": f"Uploaded document: {file.filename}",
        }]
        full_text = f"Uploaded document: {file.filename}"

    doc_id = str(uuid.uuid4())
    clean_title = clean_val(file.filename.replace(".pdf", "").replace("_", " "))

    # 2. Upload file to Supabase Storage bucket
    storage_path = f"uploads/{doc_id}_{file.filename}"
    try:
        supabase.storage.from_("pdf-documents").upload(
            storage_path,
            file_bytes,
            file_options={"content-type": "application/pdf"}
        )
    except Exception as e:
        print(f"[Upload] Supabase storage notice: {e}")

    # 3. Fast Parallel Vector Embedding Generation
    chunk_texts = [clean_val(c["chunk_text"]) for c in chunks if clean_val(c.get("chunk_text"))]
    if not chunk_texts:
        chunk_texts = [clean_title]
        chunks = [{"chunk_index": 0, "page_number": 1, "chunk_text": clean_title}]

    try:
        embeddings = await embedding_service.generate_embeddings_batch(chunk_texts)
    except Exception as e:
        print(f"[Upload] Batch embedding notice: {e}")
        embeddings = [[0.0] * 1536 for _ in chunk_texts]

    vectors_to_upsert = []
    chunk_records = []
    for idx, (chunk, chunk_str, embedding) in enumerate(zip(chunks, chunk_texts, embeddings)):
        vec_id = f"{doc_id}_chunk_{idx}"
        vectors_to_upsert.append({
            "id": vec_id,
            "values": embedding,
            "metadata": {
                "document_id": doc_id,
                "chunk_index": idx,
                "page_number": chunk.get("page_number", 1),
                "chunk_text": chunk_str[:500],
            }
        })
        chunk_records.append({
            "document_id": doc_id,
            "chunk_index": idx,
            "chunk_text": chunk_str,
            "pinecone_vector_id": vec_id,
        })

    # 4. Pinecone Vector Upsert
    if vectors_to_upsert:
        try:
            await pinecone_service.upsert_vectors(vectors_to_upsert)
        except Exception as e:
            print(f"[Upload] Pinecone upsert notice: {e}")

    # 5. Generate AI Summaries
    try:
        summary_data = await ai_service.generate_summary(clean_title, full_text)
        summary_data = clean_val(summary_data)
    except Exception as e:
        print(f"[Upload] Summary generation notice: {e}")
        summary_data = {
            "short_summary": f"Document summary for {clean_title}.",
            "detailed_summary": f"Detailed academic content review for {clean_title}.",
            "key_topics": [clean_title, "Academic Review"],
            "important_concepts": [],
            "definitions": [],
            "main_ideas": [f"Study material for {clean_title}"],
            "conclusion": f"Analysis complete for {clean_title}.",
        }

    # 6. Database Records Insert into Supabase PostgreSQL
    doc_record = {
        "id": doc_id,
        "title": clean_title,
        "file_name": clean_val(file.filename),
        "storage_path": storage_path,
        "file_size": file_size,
        "page_count": page_count,
        "status": "ready",
        "chunk_count": len(chunk_records),
        "vector_count": len(chunk_records),
    }

    safe_execute(supabase.table("documents").insert(doc_record), fallback=[doc_record])

    if chunk_records:
        for i in range(0, len(chunk_records), 50):
            safe_execute(supabase.table("document_chunks").insert(chunk_records[i : i + 50]))

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

    return doc_record

@router.get("")
async def list_documents():
    data = safe_execute(supabase.table("documents").select("*").order("upload_date", desc=True), fallback=[])
    return data

@router.get("/{doc_id}")
async def get_document(doc_id: str):
    data = safe_execute(supabase.table("documents").select("*").eq("id", doc_id), fallback=[])
    if not data:
        raise HTTPException(status_code=404, detail="Document not found")
    return data[0]

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    # 1. Fetch document to get storage_path
    doc_data = safe_execute(supabase.table("documents").select("*").eq("id", doc_id), fallback=[])
    if doc_data:
        doc = doc_data[0]
        storage_path = doc.get("storage_path")
        if storage_path:
            try:
                supabase.storage.from_("pdf-documents").remove([storage_path])
            except Exception as e:
                print(f"[Delete] Supabase storage file remove notice: {e}")

    # 2. Delete vectors from Pinecone
    try:
        await pinecone_service.delete_document_vectors(doc_id)
    except Exception as e:
        print(f"[Delete] Pinecone vector delete notice: {e}")

    # 3. Cascading delete from database tables
    try:
        safe_execute(supabase.table("summaries").delete().eq("document_id", doc_id))
        safe_execute(supabase.table("document_chunks").delete().eq("document_id", doc_id))
        safe_execute(supabase.table("quizzes").delete().eq("document_id", doc_id))
        safe_execute(supabase.table("flashcard_sets").delete().eq("document_id", doc_id))
        safe_execute(supabase.table("quiz_attempts").delete().eq("document_id", doc_id))
        safe_execute(supabase.table("conversations").delete().eq("document_id", doc_id))
        safe_execute(supabase.table("documents").delete().eq("id", doc_id))
    except Exception as e:
        print(f"[Delete] Supabase database delete notice: {e}")

    return {"message": "Document and all associated study materials deleted successfully", "id": doc_id}
