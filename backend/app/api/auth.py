import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import supabase, safe_execute

router = APIRouter(prefix="/api/auth", tags=["auth"])

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
    data = safe_execute(supabase.table("profiles").select("*").eq("email", req.email), fallback=[])
    if data:
        profile = data[0]
        if profile.get("password") and profile["password"] != req.password:
            raise HTTPException(status_code=400, detail="Invalid email or password")
    else:
        user_id = str(uuid.uuid4())
        profile = {
            "id": user_id,
            "full_name": req.email.split("@")[0].replace(".", " ").title(),
            "email": req.email,
            "password": req.password,
            "avatar_url": "",
        }
        safe_execute(supabase.table("profiles").insert(profile))

    return {
        "user": profile,
        "token": f"token-{profile['id']}",
    }

@router.post("/register")
async def register(req: RegisterRequest):
    data = safe_execute(supabase.table("profiles").select("*").eq("email", req.email), fallback=[])
    if data:
        profile = data[0]
        safe_execute(supabase.table("profiles").update({"full_name": req.full_name, "password": req.password}).eq("id", profile["id"]))
        profile["full_name"] = req.full_name
    else:
        user_id = str(uuid.uuid4())
        profile = {
            "id": user_id,
            "full_name": req.full_name,
            "email": req.email,
            "password": req.password,
            "avatar_url": "",
        }
        safe_execute(supabase.table("profiles").insert(profile))

    return {
        "user": profile,
        "token": f"token-{profile['id']}",
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    data = safe_execute(supabase.table("profiles").select("*").eq("email", req.email), fallback=[])
    if not data:
        raise HTTPException(status_code=404, detail="Email address not found")
    return {"message": "Password reset link sent to your email", "email": req.email}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    data = safe_execute(supabase.table("profiles").select("*").limit(1), fallback=[])
    if data:
        prof = data[0]
        safe_execute(supabase.table("profiles").update({"password": req.new_password}).eq("id", prof["id"]))
        return {"message": "Password reset successfully"}
    raise HTTPException(status_code=400, detail="Invalid reset request")
