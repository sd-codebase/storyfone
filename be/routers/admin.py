from __future__ import annotations

import hashlib
import random
import string
from typing import Any, Dict
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from db import get_db
from routers.admin_crud import make_crud_router
from schemas import (
    AuthorCreate, AuthorOut, AuthorUpdate,
    GenreCreate, GenreOut, GenreUpdate,
    GenerateOtpResponse,
    LanguageCreate, LanguageOut, LanguageUpdate,
    NarratorCreate, NarratorOut, NarratorUpdate,
    UserCreate, UserOut, UserUpdate,
)


# --- Helpers ---

def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def _hash_sensitive_fields(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc.get("whatsapp_otp"):
        doc["whatsapp_otp"] = _sha256(doc["whatsapp_otp"])
    if doc.get("pin"):
        doc["pin"] = _sha256(doc["pin"])
    return doc


# --- doc_to_out converters ---

def _language_out(doc: Dict[str, Any]) -> LanguageOut:
    return LanguageOut(
        id=doc["_id"], name=doc["name"],
        created_at=doc["created_at"], updated_at=doc["updated_at"],
    )


def _genre_out(doc: Dict[str, Any]) -> GenreOut:
    return GenreOut(
        id=doc["_id"], name=doc["name"],
        icon=doc.get("icon", ""), is_adult=doc.get("is_adult", False),
        created_at=doc["created_at"], updated_at=doc["updated_at"],
    )


def _author_out(doc: Dict[str, Any]) -> AuthorOut:
    return AuthorOut(
        id=doc["_id"], name=doc["name"], bio=doc.get("bio"),
        created_at=doc["created_at"], updated_at=doc["updated_at"],
    )


def _narrator_out(doc: Dict[str, Any]) -> NarratorOut:
    return NarratorOut(
        id=doc["_id"], name=doc["name"], bio=doc.get("bio"),
        created_at=doc["created_at"], updated_at=doc["updated_at"],
    )


def _user_out(doc: Dict[str, Any]) -> UserOut:
    return UserOut(
        id=doc["_id"], name=doc["name"],
        whatsapp_number=doc["whatsapp_number"],
        is_verified=doc.get("is_verified", False),
        birthdate=doc.get("birthdate"),
        plan=doc.get("plan", "Max"),
        status=doc.get("status", "active"),
        created_at=doc["created_at"], updated_at=doc["updated_at"],
    )


# --- CRUD routers ---

languages_router = make_crud_router(
    prefix="/api/v1/admin/languages", tag="languages",
    collection_name="languages",
    create_model=LanguageCreate, update_model=LanguageUpdate, out_model=LanguageOut,
    doc_to_out=_language_out,
)

genres_router = make_crud_router(
    prefix="/api/v1/admin/genres", tag="genres",
    collection_name="genres",
    create_model=GenreCreate, update_model=GenreUpdate, out_model=GenreOut,
    doc_to_out=_genre_out,
)

authors_router = make_crud_router(
    prefix="/api/v1/admin/authors", tag="authors",
    collection_name="authors",
    create_model=AuthorCreate, update_model=AuthorUpdate, out_model=AuthorOut,
    doc_to_out=_author_out,
)

narrators_router = make_crud_router(
    prefix="/api/v1/admin/narrators", tag="narrators",
    collection_name="narrators",
    create_model=NarratorCreate, update_model=NarratorUpdate, out_model=NarratorOut,
    doc_to_out=_narrator_out,
)

users_router = make_crud_router(
    prefix="/api/v1/admin/users", tag="users",
    collection_name="users",
    create_model=UserCreate, update_model=UserUpdate, out_model=UserOut,
    doc_to_out=_user_out,
    pre_insert=_hash_sensitive_fields,
    pre_update=_hash_sensitive_fields,
)


# --- OTP endpoint ---

otp_router = APIRouter(prefix="/api/v1/admin/users", tags=["users"])


@otp_router.post("/{user_id}/generate-otp", response_model=GenerateOtpResponse)
async def generate_otp(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(404, "User not found")

    otp = "".join(random.choices(string.digits, k=6))
    hashed = _sha256(otp)
    await db.users.update_one({"_id": user_id}, {"$set": {"whatsapp_otp": hashed}})

    number = user["whatsapp_number"]
    message = quote(f"Your Storyfone OTP is: {otp}")
    whatsapp_url = f"https://wa.me/{number}?text={message}"

    return GenerateOtpResponse(otp=otp, whatsapp_number=number, whatsapp_url=whatsapp_url)
