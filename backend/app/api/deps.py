import uuid
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends
try:
    from app.database import supabase, safe_execute
    from app.api.auth import _users_db
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.api.auth import _users_db

def parse_user_id_from_token(token: str) -> Optional[str]:
    """
    Extracts the user ID from various token formats:
    - 'Bearer token-<user_id>'
    - 'Bearer <user_id>'
    - 'token-<user_id>'
    - '<user_id>'
    """
    if not token:
        return None
    token = token.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    if token.startswith("token-"):
        token = token[6:].strip()
    return token if token else None

async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the currently authenticated user.
    """
    user_id = None
    if authorization:
        user_id = parse_user_id_from_token(authorization)
    if not user_id and x_user_id:
        user_id = x_user_id.strip()

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to access your account."
        )

    # 1. Check in-memory user cache
    if user_id in _users_db:
        return _users_db[user_id]
    for k, prof in _users_db.items():
        if isinstance(prof, dict) and prof.get("id") == user_id:
            return prof

    # 2. Query Supabase database
    data = safe_execute(supabase.table("profiles").select("*").eq("id", user_id), fallback=[])
    if data and len(data) > 0:
        user_prof = data[0]
        # Sync cache
        if user_prof.get("email"):
            _users_db[user_prof["email"]] = user_prof
        return user_prof

    raise HTTPException(
        status_code=401,
        detail="User account not found or session has expired. Please sign in again."
    )

async def get_optional_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
) -> Optional[Dict[str, Any]]:
    """
    Optional user dependency that returns None instead of raising 401 if unauthenticated.
    """
    try:
        return await get_current_user(authorization, x_user_id)
    except HTTPException:
        return None
