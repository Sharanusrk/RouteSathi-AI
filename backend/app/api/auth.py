import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.entities import User
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterPayload(BaseModel):
    full_name: str
    email: str
    password: str
    phone: Optional[str] = ""
    home_city: Optional[str] = "Bangalore"
    role: Optional[str] = "USER"
    preferred_categories: Optional[List[str]] = ["Historical", "Couple", "Nature"]


class LoginPayload(BaseModel):
    email: str
    password: str


class PreferencesUpdatePayload(BaseModel):
    home_city: Optional[str] = None
    preferences: Optional[dict] = None
    toggle_saved_place_id: Optional[int] = None


def _serialize_user(user: User) -> dict:
    try:
        prefs = json.loads(user.preferences_json or "{}")
    except Exception:
        prefs = {}
    try:
        saved = json.loads(user.saved_places_json or "[]")
    except Exception:
        saved = []
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone,
        "home_city": user.home_city,
        "preferences": prefs,
        "saved_places": saved,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.post("/register")
def register_user(payload: RegisterPayload, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    role_val = "ADMIN" if payload.role and payload.role.upper() == "ADMIN" else "USER"
    new_user = User(
        full_name=payload.full_name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
        role=role_val,
        phone=payload.phone,
        home_city=payload.home_city or "Bangalore",
        preferences_json=json.dumps({
            "categories": payload.preferred_categories or ["Historical", "Couple", "Food"],
            "crowdPreference": "low",
            "safetyPriority": "high",
            "travelMode": "public",
        }),
        saved_places_json="[]",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return {
        "message": "Registration successful",
        "access_token": token,
        "token_type": "bearer",
        "user": _serialize_user(new_user),
    }


@router.post("/login")
def login_user(payload: LoginPayload, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": _serialize_user(user),
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"user": _serialize_user(current_user)}


@router.put("/preferences")
def update_user_preferences(
    payload: PreferencesUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.home_city:
        current_user.home_city = payload.home_city.strip()
    if payload.preferences is not None:
        current_user.preferences_json = json.dumps(payload.preferences)
    if payload.toggle_saved_place_id is not None:
        try:
            saved = json.loads(current_user.saved_places_json or "[]")
        except Exception:
            saved = []
        pid = int(payload.toggle_saved_place_id)
        if pid in saved:
            saved.remove(pid)
        else:
            saved.append(pid)
        current_user.saved_places_json = json.dumps(saved)

    db.commit()
    db.refresh(current_user)
    return {"message": "Preferences updated", "user": _serialize_user(current_user)}
