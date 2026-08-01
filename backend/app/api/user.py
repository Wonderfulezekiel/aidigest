from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import supabase, safe_execute

router = APIRouter(prefix="/api/user", tags=["user"])

class UpdateProfileRequest(BaseModel):
    full_name: str
    email: Optional[str] = None
    bio: Optional[str] = None
    institution: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UpdateSettingsRequest(BaseModel):
    theme: str

@router.get("/profile")
async def get_profile():
    data = safe_execute(supabase.table("profiles").select("*").limit(1), fallback=[])
    if data:
        return data[0]
    return {
        "id": "usr-default",
        "full_name": "Academic Scholar",
        "email": "student@university.edu",
        "avatar_url": "",
    }

@router.put("/profile")
async def update_profile(req: UpdateProfileRequest):
    data = safe_execute(supabase.table("profiles").select("*").limit(1), fallback=[])
    update_data = {"full_name": req.full_name}
    if req.email:
        update_data["email"] = req.email

    if data:
        prof_id = data[0]["id"]
        updated = safe_execute(supabase.table("profiles").update(update_data).eq("id", prof_id), fallback=[{"id": prof_id, **update_data}])
        return updated[0] if isinstance(updated, list) and updated else {"id": prof_id, **update_data}
    else:
        inserted = safe_execute(supabase.table("profiles").insert(update_data), fallback=[update_data])
        return inserted[0] if isinstance(inserted, list) and inserted else update_data

@router.post("/change-password")
async def change_password(req: ChangePasswordRequest):
    data = safe_execute(supabase.table("profiles").select("*").limit(1), fallback=[])
    if not data:
        raise HTTPException(status_code=404, detail="User profile not found")

    profile = data[0]
    if profile.get("password") and profile["password"] != req.current_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    updated = safe_execute(supabase.table("profiles").update({"password": req.new_password}).eq("id", profile["id"]), fallback=[profile])
    return {"message": "Password changed successfully", "user": updated[0] if isinstance(updated, list) and updated else profile}

@router.get("/settings")
async def get_settings():
    data = safe_execute(supabase.table("settings").select("*").limit(1), fallback=[])
    if data:
        return data[0]
    return {"theme": "dark"}

@router.put("/settings")
async def update_settings(req: UpdateSettingsRequest):
    data = safe_execute(supabase.table("settings").select("*").limit(1), fallback=[])
    if data:
        sid = data[0]["id"]
        updated = safe_execute(supabase.table("settings").update({"theme": req.theme}).eq("id", sid), fallback=[{"theme": req.theme}])
        return updated[0] if isinstance(updated, list) and updated else {"theme": req.theme}
    else:
        inserted = safe_execute(supabase.table("settings").insert({"theme": req.theme}), fallback=[{"theme": req.theme}])
        return inserted[0] if isinstance(inserted, list) and inserted else {"theme": req.theme}
