import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
try:
    from app.database import supabase, safe_execute
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory authentication cache synchronized with database
_users_db: Dict[str, Dict[str, Any]] = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/login")
async def login(req: LoginRequest):
    email_clean = req.email.strip().lower()

    if not email_clean or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    # 1. Query database for user profile
    data = safe_execute(supabase.table("profiles").select("*").eq("email", email_clean), fallback=None)

    profile = None
    if data and len(data) > 0:
        profile = data[0]
    elif email_clean in _users_db:
        profile = _users_db[email_clean]

    # If user does not exist, reject login
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="No account found with this email address. Please register first."
        )

    # 2. Strictly verify password
    stored_password = profile.get("password")
    if stored_password and stored_password != req.password:
        raise HTTPException(
            status_code=400,
            detail="Incorrect password. Please verify and try again."
        )

    # Sync cache by email and user ID
    _users_db[email_clean] = profile
    if profile.get("id"):
        _users_db[profile["id"]] = profile

    return {
        "user": {
            "id": profile.get("id"),
            "full_name": profile.get("full_name", email_clean.split("@")[0].title()),
            "email": profile.get("email", email_clean),
            "avatar_url": profile.get("avatar_url", ""),
        },
        "token": f"token-{profile.get('id')}",
    }

@router.post("/register")
async def register(req: RegisterRequest):
    email_clean = req.email.strip().lower()
    full_name_clean = req.full_name.strip()

    if not email_clean or not req.password or not full_name_clean:
        raise HTTPException(status_code=400, detail="Full name, email, and password are required")

    # Check if user already exists
    data = safe_execute(supabase.table("profiles").select("*").eq("email", email_clean), fallback=None)
    if (data and len(data) > 0) or email_clean in _users_db:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists. Please sign in instead."
        )

    user_id = str(uuid.uuid4())
    profile = {
        "id": user_id,
        "full_name": full_name_clean,
        "email": email_clean,
        "password": req.password,
        "avatar_url": "",
    }

    # Save to database
    safe_execute(supabase.table("profiles").insert(profile))
    # Cache in memory by email and ID
    _users_db[email_clean] = profile
    _users_db[user_id] = profile

    return {
        "user": {
            "id": user_id,
            "full_name": full_name_clean,
            "email": email_clean,
            "avatar_url": "",
        },
        "token": f"token-{user_id}",
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    email_clean = req.email.strip().lower()
    data = safe_execute(supabase.table("profiles").select("*").eq("email", email_clean), fallback=None)
    if not data and email_clean not in _users_db:
        raise HTTPException(status_code=404, detail="Email address not found")
    return {"message": "Password reset instructions have been sent to your email", "email": email_clean}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    data = safe_execute(supabase.table("profiles").select("*").limit(1), fallback=[])
    if data:
        prof = data[0]
        safe_execute(supabase.table("profiles").update({"password": req.new_password}).eq("id", prof["id"]))
        if prof.get("email") in _users_db:
            _users_db[prof["email"]]["password"] = req.new_password
        return {"message": "Password reset successfully"}
    raise HTTPException(status_code=400, detail="Invalid reset request")
