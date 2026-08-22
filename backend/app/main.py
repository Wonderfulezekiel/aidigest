from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.api import auth, documents, summary, chat, user, quiz, flashcards
except ModuleNotFoundError:
    from backend.app.api import auth, documents, summary, chat, user, quiz, flashcards

app = FastAPI(
    title="PDF AIDigest API",
    description="Intelligent Document Summarization, Conversational Q&A, Quizzing & Flashcard Assistant API",
    version="1.1.0",
)

# Enable universal CORS for development and all Vercel/Render deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://aidigest.vercel.app",
        "https://aidigest.onrender.com",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(summary.router)
app.include_router(chat.router)
app.include_router(user.router)
app.include_router(quiz.router)
app.include_router(flashcards.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "PDF AIDigest FastAPI Backend",
        "version": "1.1.0",
        "features": ["summarization", "rag_chat", "interactive_quiz", "flashcard_decks"],
        "vector_db": "Pinecone",
        "database": "Supabase PostgreSQL",
        "ai_model": "OpenRouter API",
    }
