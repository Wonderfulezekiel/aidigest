import uuid
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional

try:
    from app.database import supabase, safe_execute
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])

_decks_cache: Dict[str, Dict[str, Any]] = {}

@router.post("/generate/{doc_id}")
async def generate_flashcards(doc_id: str):
    """
    Generates a new AI flashcard deck from document content.
    """
    doc_res = safe_execute(supabase.table("documents").select("*").eq("id", doc_id), fallback=[])
    if not doc_res:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = doc_res[0]
    doc_title = doc.get("title", "Academic Document")

    chunks = safe_execute(supabase.table("document_chunks").select("chunk_text").eq("document_id", doc_id).limit(10), fallback=[])
    text_content = "\n\n".join([c["chunk_text"] for c in chunks]) if chunks else doc_title

    deck_data = await ai_service.generate_flashcards(doc_title, text_content)

    set_id = str(uuid.uuid4())
    cards_list = []
    for idx, c in enumerate(deck_data.get("cards", [])):
        card_id = str(uuid.uuid4())
        cards_list.append({
            "id": card_id,
            "set_id": set_id,
            "card_index": idx + 1,
            "front": c.get("front", ""),
            "back": c.get("back", ""),
            "category": c.get("category", "Core Concept"),
            "difficulty": c.get("difficulty", "Medium"),
            "page_citation": c.get("page_citation", 1),
        })

    deck_record = {
        "id": set_id,
        "document_id": doc_id,
        "document_title": doc_title,
        "title": deck_data.get("title", f"Study Deck: {doc_title}"),
        "card_count": len(cards_list),
        "cards": cards_list,
    }

    _decks_cache[set_id] = deck_record

    safe_execute(supabase.table("flashcard_sets").insert({
        "id": set_id,
        "document_id": doc_id,
        "title": deck_record["title"],
        "card_count": deck_record["card_count"],
    }))

    for card in cards_list:
        safe_execute(supabase.table("flashcards").insert(card))

    return deck_record

@router.get("/document/{doc_id}")
async def get_flashcards_by_document(doc_id: str):
    """
    Returns flashcards for a document or auto-generates the first deck.
    """
    # Check cache first
    existing = [d for d in _decks_cache.values() if d["document_id"] == doc_id]
    if existing:
        return existing[0]

    # Check Supabase
    db_sets = safe_execute(supabase.table("flashcard_sets").select("*").eq("document_id", doc_id), fallback=[])
    if db_sets:
        s = db_sets[0]
        set_id = s["id"]
        db_cards = safe_execute(supabase.table("flashcards").select("*").eq("set_id", set_id).order("card_index", desc=False), fallback=[])
        doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
        doc_title = doc_res[0]["title"] if doc_res else "Academic Document"

        deck = {
            "id": set_id,
            "document_id": doc_id,
            "document_title": doc_title,
            "title": s.get("title", f"Study Deck: {doc_title}"),
            "card_count": len(db_cards),
            "cards": db_cards,
        }
        _decks_cache[set_id] = deck
        return deck

    # Auto-generate if none exist
    return await generate_flashcards(doc_id)

@router.get("/all")
async def get_all_flashcard_decks():
    """
    Returns all flashcard decks across all documents.
    """
    if _decks_cache:
        return list(_decks_cache.values())

    db_sets = safe_execute(supabase.table("flashcard_sets").select("*").order("created_at", desc=True), fallback=[])
    results = []
    for s in db_sets:
        set_id = s["id"]
        doc_id = s["document_id"]
        db_cards = safe_execute(supabase.table("flashcards").select("*").eq("set_id", set_id).order("card_index", desc=False), fallback=[])
        doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
        doc_title = doc_res[0]["title"] if doc_res else "Academic Document"
        deck = {
            "id": set_id,
            "document_id": doc_id,
            "document_title": doc_title,
            "title": s.get("title", f"Study Deck: {doc_title}"),
            "card_count": len(db_cards),
            "cards": db_cards,
        }
        _decks_cache[set_id] = deck
        results.append(deck)

    return results

@router.delete("/{set_id}")
async def delete_flashcards(set_id: str):
    if set_id in _decks_cache:
        del _decks_cache[set_id]
    safe_execute(supabase.table("flashcard_sets").delete().eq("id", set_id))
    return {"message": "Flashcard deck deleted successfully", "id": set_id}
