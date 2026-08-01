import time
from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

supabase: Client = get_supabase_client()

def safe_execute(query_builder, fallback=None, retries=2):
    """
    Safely executes a Supabase PostgREST query builder with automatic retries
    and network exception shielding (e.g. Errno 11001 getaddrinfo failed).
    """
    if fallback is None:
        fallback = []

    for attempt in range(retries + 1):
        try:
            res = query_builder.execute()
            if hasattr(res, "data"):
                return res.data
            return res
        except Exception as e:
            print(f"[Supabase] Network query notice (Attempt {attempt+1}/{retries+1}): {e}")
            if attempt < retries:
                time.sleep(0.5)

    return fallback
