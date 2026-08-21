import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

try:
    from app.database import supabase, safe_execute
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class SubmitQuizRequest(BaseModel):
    answers: Dict[str, str] # question_id -> chosen_option
    time_spent_seconds: Optional[int] = 0

# In-memory backup cache to guarantee persistence even if custom DB tables are pending migration
_quizzes_cache: Dict[str, Dict[str, Any]] = {}
_attempts_cache: List[Dict[str, Any]] = []

@router.post("/generate/{doc_id}")
async def generate_quiz(doc_id: str):
    """
    Generates a new AI quiz from document content and persists it.
    """
    # 1. Fetch document metadata
    doc_res = safe_execute(supabase.table("documents").select("*").eq("id", doc_id), fallback=[])
    if not doc_res:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = doc_res[0]
    doc_title = doc.get("title", "Academic Document")

    # 2. Fetch document chunks text
    chunks = safe_execute(supabase.table("document_chunks").select("chunk_text").eq("document_id", doc_id).limit(10), fallback=[])
    text_content = "\n\n".join([c["chunk_text"] for c in chunks]) if chunks else doc_title

    # 3. Generate quiz via AI Service
    quiz_data = await ai_service.generate_quiz(doc_title, text_content)

    quiz_id = str(uuid.uuid4())
    questions_list = []
    for idx, q in enumerate(quiz_data.get("questions", [])):
        q_id = str(uuid.uuid4())
        questions_list.append({
            "id": q_id,
            "quiz_id": quiz_id,
            "question_index": idx + 1,
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "correct_answer": q.get("correct_answer", ""),
            "explanation": q.get("explanation", ""),
            "topic": q.get("topic", "General"),
            "page_citation": q.get("page_citation", 1),
        })

    quiz_record = {
        "id": quiz_id,
        "document_id": doc_id,
        "document_title": doc_title,
        "title": quiz_data.get("title", f"Mastery Quiz: {doc_title}"),
        "description": quiz_data.get("description", "Assess your understanding of fundamental principles."),
        "question_count": len(questions_list),
        "questions": questions_list,
    }

    # Store in memory cache
    _quizzes_cache[quiz_id] = quiz_record

    # Attempt to persist in Supabase if tables exist
    safe_execute(supabase.table("quizzes").insert({
        "id": quiz_id,
        "document_id": doc_id,
        "title": quiz_record["title"],
        "description": quiz_record["description"],
        "question_count": quiz_record["question_count"],
    }))

    for q in questions_list:
        safe_execute(supabase.table("quiz_questions").insert(q))

    return quiz_record

@router.get("/document/{doc_id}")
async def get_quizzes_by_document(doc_id: str):
    """
    Returns existing quizzes for a document or automatically generates the first one.
    """
    # Check cache first
    existing = [q for q in _quizzes_cache.values() if q["document_id"] == doc_id]
    if existing:
        return existing

    # Check Supabase
    db_quizzes = safe_execute(supabase.table("quizzes").select("*").eq("document_id", doc_id), fallback=[])
    if db_quizzes:
        results = []
        for q in db_quizzes:
            q_id = q["id"]
            db_questions = safe_execute(supabase.table("quiz_questions").select("*").eq("quiz_id", q_id).order("question_index", desc=False), fallback=[])
            doc_res = safe_execute(supabase.table("documents").select("title").eq("id", doc_id), fallback=[])
            doc_title = doc_res[0]["title"] if doc_res else "Academic Document"
            
            full_quiz = {
                "id": q_id,
                "document_id": doc_id,
                "document_title": doc_title,
                "title": q.get("title", f"Mastery Quiz: {doc_title}"),
                "description": q.get("description", "Interactive learning quiz."),
                "question_count": len(db_questions),
                "questions": db_questions,
            }
            _quizzes_cache[q_id] = full_quiz
            results.append(full_quiz)
        return results

    # Auto-generate if none exist
    return [await generate_quiz(doc_id)]

@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str):
    """
    Returns full quiz by ID.
    """
    if quiz_id in _quizzes_cache:
        return _quizzes_cache[quiz_id]

    db_quiz = safe_execute(supabase.table("quizzes").select("*").eq("id", quiz_id), fallback=[])
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    q = db_quiz[0]
    db_questions = safe_execute(supabase.table("quiz_questions").select("*").eq("quiz_id", quiz_id).order("question_index", desc=False), fallback=[])
    doc_res = safe_execute(supabase.table("documents").select("title").eq("id", q["document_id"]), fallback=[])
    doc_title = doc_res[0]["title"] if doc_res else "Academic Document"

    full_quiz = {
        "id": quiz_id,
        "document_id": q["document_id"],
        "document_title": doc_title,
        "title": q.get("title", "Mastery Quiz"),
        "description": q.get("description", ""),
        "question_count": len(db_questions),
        "questions": db_questions,
    }
    _quizzes_cache[quiz_id] = full_quiz
    return full_quiz

@router.post("/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, req: SubmitQuizRequest):
    """
    Evaluates user answers, computes score & grade, identifies weak areas,
    and returns rich AI learning explanations for any incorrect answers.
    """
    quiz = await get_quiz(quiz_id)
    questions = quiz.get("questions", [])

    correct_count = 0
    total_count = len(questions)
    results = []

    for q in questions:
        q_id = q["id"]
        chosen = req.answers.get(q_id, "")
        correct = q["correct_answer"]
        is_correct = (chosen.strip().lower() == correct.strip().lower()) if chosen else False

        if is_correct:
            correct_count += 1

        results.append({
            "question_id": q_id,
            "question": q["question"],
            "chosen_answer": chosen,
            "correct_answer": correct,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
            "topic": q.get("topic", "General"),
            "page_citation": q.get("page_citation", 1),
        })

    percentage = round((correct_count / total_count * 100), 1) if total_count > 0 else 0.0

    if percentage >= 90:
        grade = "A+"
        feedback = "Outstanding mastery! You demonstrated thorough understanding of all core concepts and methodology."
    elif percentage >= 80:
        grade = "A"
        feedback = "Great performance! You have a solid grasp of the material with only minor concept nuances to review."
    elif percentage >= 70:
        grade = "B"
        feedback = "Good effort! Review the detailed explanations below for questions you missed to reinforce your understanding."
    elif percentage >= 50:
        grade = "C"
        feedback = "Passing understanding, but several key topics require further study. Use the AI corrections to learn each point."
    else:
        grade = "Needs Review"
        feedback = "Don't worry! Learning happens through practice. Read through each AI explanation below carefully and retake the quiz."

    attempt_id = str(uuid.uuid4())
    attempt_record = {
        "id": attempt_id,
        "quiz_id": quiz_id,
        "quiz_title": quiz.get("title", "Mastery Quiz"),
        "document_id": quiz.get("document_id"),
        "document_title": quiz.get("document_title", "Document"),
        "score": correct_count,
        "total_questions": total_count,
        "percentage": percentage,
        "grade": grade,
        "feedback": feedback,
        "time_spent_seconds": req.time_spent_seconds or 0,
        "question_results": results,
    }

    _attempts_cache.insert(0, attempt_record)

    safe_execute(supabase.table("quiz_attempts").insert({
        "id": attempt_id,
        "quiz_id": quiz_id,
        "document_id": quiz.get("document_id"),
        "score": correct_count,
        "total_questions": total_count,
        "percentage": percentage,
        "grade": grade,
        "feedback": feedback,
        "time_spent_seconds": req.time_spent_seconds or 0,
    }))

    return attempt_record

@router.get("/attempts/user")
async def get_user_attempts():
    """
    Returns study attempt history.
    """
    if _attempts_cache:
        return _attempts_cache

    db_attempts = safe_execute(supabase.table("quiz_attempts").select("*").order("created_at", desc=True), fallback=[])
    return db_attempts

@router.delete("/{quiz_id}")
async def delete_quiz(quiz_id: str):
    if quiz_id in _quizzes_cache:
        del _quizzes_cache[quiz_id]
    safe_execute(supabase.table("quizzes").delete().eq("id", quiz_id))
    return {"message": "Quiz deleted successfully", "id": quiz_id}
