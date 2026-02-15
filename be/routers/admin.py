from __future__ import annotations

import hashlib
import random
import string
from typing import Any, Dict, List
from urllib.parse import quote

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from db import get_db
from routers.admin_crud import make_crud_router
from services.encryption import decrypt
from schemas import (
    AuthorCreate, AuthorOut, AuthorUpdate,
    GenreCreate, GenreOut, GenreUpdate,
    GenerateOtpResponse,
    LanguageCreate, LanguageOut, LanguageUpdate,
    NarratorCreate, NarratorOut, NarratorUpdate,
    ReportOut,
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
    birthdate = doc.get("birthdate")
    if not birthdate and doc.get("birthdate_encrypted"):
        try:
            birthdate = decrypt(doc["birthdate_encrypted"])
        except Exception:
            birthdate = None
    return UserOut(
        id=str(doc["_id"]), name=doc["name"],
        whatsapp_number=doc["whatsapp_number"],
        country_code=doc.get("country_code", ""),
        is_verified=doc.get("is_verified", False),
        birthdate=birthdate,
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
    # Try string _id first (nanoid from admin CRUD), then ObjectId (from mobile registration)
    user = await db.users.find_one({"_id": user_id})
    if not user:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            pass
    if not user:
        raise HTTPException(404, "User not found")

    uid = user["_id"]
    otp = "".join(random.choices(string.digits, k=6))
    hashed = _sha256(otp)
    await db.users.update_one({"_id": uid}, {"$set": {"whatsapp_otp": hashed}})

    number = user["whatsapp_number"]
    message = quote(f"Your Storyfone OTP is: {otp}")
    whatsapp_url = f"https://wa.me/{number}?text={message}"

    return GenerateOtpResponse(otp=otp, whatsapp_number=number, whatsapp_url=whatsapp_url)


# --- Reports (read-only + delete) ---

reports_router = APIRouter(prefix="/api/v1/admin/reports", tags=["reports"])


@reports_router.get("", response_model=List[ReportOut])
async def list_reports(db: AsyncIOMotorDatabase = Depends(get_db)):
    docs = await db.reports.find().sort("created_at", -1).to_list(1000)
    if not docs:
        return []

    # Batch-fetch user names
    user_ids = list({d["user_id"] for d in docs})
    # user_ids may be strings or ObjectIds — try both
    user_obj_ids = []
    for uid in user_ids:
        try:
            user_obj_ids.append(ObjectId(uid))
        except Exception:
            pass
    user_docs = await db.users.find(
        {"_id": {"$in": user_ids + user_obj_ids}}
    ).to_list(None)
    user_map: Dict[str, str] = {str(u["_id"]): u.get("name", "") for u in user_docs}

    # Batch-fetch book titles
    book_ids = list({d["book_id"] for d in docs})
    book_obj_ids = []
    for bid in book_ids:
        try:
            book_obj_ids.append(ObjectId(bid))
        except Exception:
            pass
    book_docs = await db.books.find(
        {"_id": {"$in": book_ids + book_obj_ids}}
    ).to_list(None)
    book_map: Dict[str, str] = {str(b["_id"]): b.get("title", "") for b in book_docs}

    return [
        ReportOut(
            id=str(d["_id"]),
            user_id=str(d["user_id"]),
            user_name=user_map.get(str(d["user_id"]), "Unknown"),
            book_id=str(d["book_id"]),
            book_title=book_map.get(str(d["book_id"]), "Unknown"),
            reason=d.get("reason", ""),
            created_at=str(d.get("created_at", "")),
        )
        for d in docs
    ]


@reports_router.delete("/{report_id}")
async def delete_report(report_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Try as ObjectId first, then as string
    try:
        oid = ObjectId(report_id)
        result = await db.reports.delete_one({"_id": oid})
    except Exception:
        result = await db.reports.delete_one({"_id": report_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Report not found")
    return {"ok": True}
