from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any

try:
    from app.database import supabase, safe_execute
    from app.api.deps import get_current_user
    from app.api.auth import _users_db
except ModuleNotFoundError:
    from backend.app.database import supabase, safe_execute
    from backend.app.api.deps import get_current_user
    from backend.app.api.auth import _users_db

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
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    # Re-fetch latest record from database
    data = safe_execute(supabase.table("profiles").select("*").eq("id", user_id), fallback=[current_user])
    profile = data[0] if data else current_user
    return {
        "id": profile.get("id"),
        "full_name": profile.get("full_name", "Academic Scholar"),
        "email": profile.get("email", ""),
        "avatar_url": profile.get("avatar_url", ""),
    }

@router.put("/profile")
async def update_profile(req: UpdateProfileRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    update_data = {"full_name": req.full_name.strip()}
    if req.email:
        update_data["email"] = req.email.strip().lower()

    updated = safe_execute(
        supabase.table("profiles").update(update_data).eq("id", user_id),
        fallback=[{**current_user, **update_data}]
    )

    result = updated[0] if isinstance(updated, list) and updated else {**current_user, **update_data}
    if result.get("email"):
        _users_db[result["email"]] = {**current_user, **result}

    return {
        "id": result.get("id", user_id),
        "full_name": result.get("full_name", req.full_name),
        "email": result.get("email", current_user.get("email", "")),
        "avatar_url": result.get("avatar_url", ""),
    }

@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]

    # Verify existing password
    data = safe_execute(supabase.table("profiles").select("*").eq("id", user_id), fallback=[current_user])
    profile = data[0] if data else current_user

    stored_pass = profile.get("password")
    if stored_pass and stored_pass != req.current_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    safe_execute(supabase.table("profiles").update({"password": req.new_password}).eq("id", user_id))

    if profile.get("email") in _users_db:
        _users_db[profile["email"]]["password"] = req.new_password

    return {"message": "Password changed successfully"}

@router.get("/settings")
async def get_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    data = safe_execute(supabase.table("settings").select("*").eq("user_id", user_id).limit(1), fallback=[])
    if data:
        return data[0]
    return {"theme": "dark"}

@router.put("/settings")
async def update_settings(req: UpdateSettingsRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    data = safe_execute(supabase.table("settings").select("*").eq("user_id", user_id).limit(1), fallback=[])
    if data:
        sid = data[0]["id"]
        updated = safe_execute(supabase.table("settings").update({"theme": req.theme}).eq("id", sid), fallback=[{"theme": req.theme}])
        return updated[0] if isinstance(updated, list) and updated else {"theme": req.theme}
    else:
        inserted = safe_execute(supabase.table("settings").insert({"user_id": user_id, "theme": req.theme}), fallback=[{"theme": req.theme}])
        return inserted[0] if isinstance(inserted, list) and inserted else {"theme": req.theme}
