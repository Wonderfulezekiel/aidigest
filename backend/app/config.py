import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://fcqvngpnuwowsbbiipap.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjcXZuZ3BudXdvd3NiYmlpcGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTkwNDksImV4cCI6MjEwMDYzNTA0OX0.2ZPX-vC1XVtaNe7PWXjdRV7F9rEfSIKWjGi8oWOFf7s")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "pdf-aidigest-index")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    OPENROUTER_EMBEDDING_MODEL: str = os.getenv("OPENROUTER_EMBEDDING_MODEL", "text-embedding-3-small")

    class Config:
        env_file = ".env"

settings = Settings()
