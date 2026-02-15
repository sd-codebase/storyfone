# NOTE: Do NOT add `from __future__ import annotations` — closures use dynamic types.
from datetime import datetime, date, timedelta
from typing import Optional, List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from db import get_db
from schemas import (
    AppAuthResponse,
    AppBookListResponse,
    AppBookOut,
    AppChapterOut,
    AppGenreOut,
    AppLoginRequest,
    AppRegisterRequest,
    AppUserOut,
    AppUserUpdateRequest,
    BookRatingOut,
    ChangeWhatsappRequest,
    EditorPickOut,
    EditorPickSetRequest,
    LikedBooksResponse,
    PinCreateRequest,
    PinExistsResponse,
    PinVerifyRequest,
    PinVerifyResponse,
    ProgressEntry,
    ProgressListResponse,
    ProgressSaveRequest,
    RateBookRequest,
    ReportBookRequest,
    ToggleLikeResponse,
    TrendingOut,
    TrendingSetRequest,
    UserStatsOut,
    VerifyWhatsappRequest,
)
from services.auth import create_access_token, get_current_app_user
from services.encryption import decrypt, encrypt, sha256_hash

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _user_to_out(doc: dict) -> AppUserOut:
    """Convert a MongoDB user doc to AppUserOut, decrypting fields."""
    full_number = decrypt(doc["whatsapp_encrypted"]) if doc.get("whatsapp_encrypted") else doc.get("whatsapp_number", "")
    country_code = doc.get("country_code", "")
    # Strip country_code prefix so we return local-only number
    if country_code and full_number.startswith(country_code):
        local_number = full_number[len(country_code):]
    else:
        local_number = full_number
    birthdate = decrypt(doc["birthdate_encrypted"]) if doc.get("birthdate_encrypted") else doc.get("birthdate", "")

    # has_pending_whatsapp: true if admin has set an OTP waiting for verification
    has_pending = bool(doc.get("whatsapp_otp"))

    return AppUserOut(
        id=str(doc["_id"]),
        name=doc.get("name", ""),
        whatsapp_number=local_number,
        country_code=country_code,
        birthdate=birthdate,
        is_adult=doc.get("is_adult", False),
        is_verified=doc.get("is_verified", False),
        plan=doc.get("plan", "Max"),
        status=doc.get("status", "active"),
        preferred_languages=doc.get("preferred_languages", []),
        created_at=doc.get("created_at", ""),
        has_pending_whatsapp=has_pending,
    )


def _calc_is_adult(birthdate_str: str) -> bool:
    """Return True if 18+ based on YYYY-MM-DD birthdate."""
    try:
        bd = date.fromisoformat(birthdate_str)
        today = date.today()
        age = today.year - bd.year - ((today.month, today.day) < (bd.month, bd.day))
        return age >= 18
    except (ValueError, TypeError):
        return False


def _book_doc_to_out(doc: dict, ch_count: int, author_map: dict) -> AppBookOut:
    """Convert a MongoDB book doc to AppBookOut."""
    book_id = doc["_id"]
    author_names = [author_map.get(aid, aid) for aid in doc.get("authors", [])]
    return AppBookOut(
        id=str(book_id),
        title=doc.get("title", ""),
        authors=author_names,
        genres=doc.get("genres", []),
        description=doc.get("description", ""),
        is_adult=doc.get("is_adult", False),
        language=doc.get("language"),
        tags=doc.get("tags", []),
        thumbnail_url=doc.get("thumbnail_url"),
        chapter_count=ch_count,
        listen_count=doc.get("listen_count", 0),
        average_rating=doc.get("average_rating", 0),
        rating_count=doc.get("rating_count", 0),
        created_at=doc.get("created_at", ""),
    )


async def _build_author_map(db: AsyncIOMotorDatabase) -> dict:
    author_map: dict = {}
    async for a in db.authors.find({}, {"name": 1}):
        author_map[str(a["_id"])] = a.get("name", "")
    return author_map


# ---------------------------------------------------------------------------
# Auth router (open — no JWT)
# ---------------------------------------------------------------------------

auth_router = APIRouter(prefix="/api/v1/app/auth", tags=["Mobile Auth"])


@auth_router.post("/register", response_model=AppAuthResponse)
async def register(body: AppRegisterRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    full_number = body.country_code + body.whatsapp_number
    wh = sha256_hash(full_number)

    existing = await db.users.find_one({"whatsapp_hash": wh})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already registered")

    now = datetime.utcnow().isoformat()
    is_adult = _calc_is_adult(body.birthdate)

    doc = {
        "name": body.name,
        "whatsapp_number": body.whatsapp_number,
        "whatsapp_encrypted": encrypt(full_number),
        "whatsapp_hash": wh,
        "country_code": body.country_code,
        "birthdate_encrypted": encrypt(body.birthdate),
        "pin_encrypted": encrypt(body.pin),
        "is_adult": is_adult,
        "is_verified": False,
        "plan": "Pro",
        "status": "active",
        "preferred_languages": body.preferred_languages or [],
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_access_token(subject=str(result.inserted_id))
    return AppAuthResponse(access_token=token, token_type="bearer", user=_user_to_out(doc))


@auth_router.post("/login", response_model=AppAuthResponse)
async def login(body: AppLoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    full_number = body.country_code + body.whatsapp_number
    wh = sha256_hash(full_number)

    user = await db.users.find_one({"whatsapp_hash": wh})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.get("status") == "disabled":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account has been deleted")

    stored_pin = user.get("pin_encrypted")
    if not stored_pin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid PIN")
    try:
        if decrypt(stored_pin) != body.pin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid PIN")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid PIN")

    token = create_access_token(subject=str(user["_id"]))
    return AppAuthResponse(access_token=token, token_type="bearer", user=_user_to_out(user))


@auth_router.get("/languages")
async def list_available_languages(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Public endpoint — list available languages for signup flow."""
    cursor = db.languages.find({}, {"name": 1})
    out = []
    async for doc in cursor:
        out.append({"id": str(doc["_id"]), "name": doc.get("name", "")})
    return out


# ---------------------------------------------------------------------------
# Protected router (JWT required)
# ---------------------------------------------------------------------------

protected_router = APIRouter(prefix="/api/v1/app", tags=["Mobile App"])


# --- User profile ---

@protected_router.get("/users/me", response_model=AppUserOut)
async def get_me(user: dict = Depends(get_current_app_user)):
    return _user_to_out(user)


@protected_router.put("/users/me", response_model=AppUserOut)
async def update_me(
    body: AppUserUpdateRequest,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.preferred_languages is not None:
        updates["preferred_languages"] = body.preferred_languages
    if updates:
        updates["updated_at"] = datetime.utcnow().isoformat()
        await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
        user.update(updates)
    return _user_to_out(user)


@protected_router.delete("/users/me", status_code=200)
async def delete_account(
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"status": "disabled", "updated_at": datetime.utcnow().isoformat()}},
    )
    return {"ok": True}


# --- PIN ---

@protected_router.post("/users/me/pin", status_code=201)
async def create_pin(
    body: PinCreateRequest,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"pin_encrypted": encrypt(body.pin), "updated_at": datetime.utcnow().isoformat()}},
    )
    return {"ok": True}


@protected_router.post("/users/me/pin/verify", response_model=PinVerifyResponse)
async def verify_pin(
    body: PinVerifyRequest,
    user: dict = Depends(get_current_app_user),
):
    stored = user.get("pin_encrypted")
    if not stored:
        return PinVerifyResponse(valid=False)
    try:
        return PinVerifyResponse(valid=decrypt(stored) == body.pin)
    except Exception:
        return PinVerifyResponse(valid=False)


@protected_router.get("/users/me/pin/exists", response_model=PinExistsResponse)
async def pin_exists(user: dict = Depends(get_current_app_user)):
    return PinExistsResponse(has_pin=bool(user.get("pin_encrypted")))


# --- User stats ---

@protected_router.get("/users/me/stats", response_model=UserStatsOut)
async def get_user_stats(
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    doc = await db.user_stats.find_one({"user_id": uid})
    if not doc:
        return UserStatsOut()
    total_seconds = doc.get("total_seconds", 0)
    return UserStatsOut(
        total_hours=round(total_seconds / 3600, 1),
        unique_books=doc.get("unique_books", 0),
        streak_days=doc.get("streak_days", 0),
    )


@protected_router.post("/users/me/listen-time", status_code=200)
async def record_listen_time(
    seconds: float = Query(..., gt=0),
    book_id: str = Query(...),
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    today = date.today().isoformat()
    await db.user_stats.update_one(
        {"user_id": uid},
        {
            "$inc": {"total_seconds": seconds},
            "$addToSet": {"listen_dates": today, "book_ids": book_id},
            "$set": {"last_listen_date": today},
        },
        upsert=True,
    )
    # Recompute unique_books and streak
    stats = await db.user_stats.find_one({"user_id": uid})
    if stats:
        unique_books = len(stats.get("book_ids", []))
        dates = sorted(stats.get("listen_dates", []), reverse=True)
        streak = 0
        if dates:
            current = date.today()
            for d_str in dates:
                d = date.fromisoformat(d_str)
                if d == current:
                    streak += 1
                    current = current - timedelta(days=1)
                elif d < current:
                    break
        await db.user_stats.update_one(
            {"user_id": uid},
            {"$set": {"unique_books": unique_books, "streak_days": streak}},
        )
    return {"ok": True}


# --- WhatsApp (unverified users only) ---

@protected_router.post("/users/me/change-whatsapp", status_code=200)
async def change_whatsapp(
    body: ChangeWhatsappRequest,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if user.get("is_verified"):
        raise HTTPException(status_code=403, detail="Number already verified")
    import random
    new_full = body.new_country_code + body.new_whatsapp_number
    new_hash = sha256_hash(new_full)
    existing = await db.users.find_one({"whatsapp_hash": new_hash, "_id": {"$ne": user["_id"]}})
    if existing:
        raise HTTPException(status_code=409, detail="This number is already registered")
    # Store local-only number and update encrypted/hash for the new number
    wh = sha256_hash(new_full)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "whatsapp_number": body.new_whatsapp_number,
            "whatsapp_encrypted": encrypt(new_full),
            "whatsapp_hash": wh,
            "country_code": body.new_country_code,
            "updated_at": datetime.utcnow().isoformat(),
        }},
    )
    return {"ok": True}


@protected_router.post("/users/me/verify-whatsapp", status_code=200)
async def verify_whatsapp(
    body: VerifyWhatsappRequest,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    import hashlib

    admin_otp = user.get("whatsapp_otp")  # SHA256 hash set by admin generate-otp
    if not admin_otp:
        raise HTTPException(status_code=400, detail="No pending verification")

    otp_hash = hashlib.sha256(body.otp.encode()).hexdigest()
    if otp_hash != admin_otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "is_verified": True,
            "whatsapp_otp": None,
            "updated_at": datetime.utcnow().isoformat(),
        }},
    )
    return {"ok": True}


# --- Books ---

@protected_router.get("/books", response_model=AppBookListResponse)
async def list_books(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_adult: Optional[bool] = Query(None),
    languages: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    query: dict = {"is_published": True}

    # Server-side age enforcement: under-18 users never see adult content
    if not user.get("is_adult", False):
        query["is_adult"] = False
    elif is_adult is not None:
        query["is_adult"] = is_adult

    if category:
        query["genres"] = category

    # Language filtering: explicit param or user's preferred languages
    lang_ids = None
    if languages:
        lang_ids = [lid.strip() for lid in languages.split(",") if lid.strip()]
    elif user.get("preferred_languages"):
        lang_ids = user["preferred_languages"]
    if lang_ids:
        query["language"] = {"$in": lang_ids}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]

    author_map = await _build_author_map(db)
    total = await db.books.count_documents(query)
    cursor = db.books.find(query).skip(skip).limit(limit).sort("created_at", -1)
    books_out: List[AppBookOut] = []
    async for doc in cursor:
        ch_count = await db.chapters.count_documents({"book_id": str(doc["_id"])})
        books_out.append(_book_doc_to_out(doc, ch_count, author_map))
    return AppBookListResponse(books=books_out, total=total)


@protected_router.get("/books/{book_id}", response_model=AppBookOut)
async def get_book(
    book_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    doc = await db.books.find_one({"_id": ObjectId(book_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Book not found")
    ch_count = await db.chapters.count_documents({"book_id": book_id})
    author_map = await _build_author_map(db)
    return _book_doc_to_out(doc, ch_count, author_map)


@protected_router.get("/books/{book_id}/chapters", response_model=List[AppChapterOut])
async def list_chapters(book_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db.chapters.find(
        {"book_id": book_id, "is_published": True},
    ).sort([("order", 1), ("created_at", 1)])
    out: List[AppChapterOut] = []
    idx = 0
    async for doc in cursor:
        out.append(AppChapterOut(
            id=str(doc["_id"]),
            name=doc.get("name", ""),
            book_id=doc.get("book_id", ""),
            audio_hls=doc.get("audio_hls"),
            order=doc.get("order", idx),
            created_at=doc.get("created_at", ""),
        ))
        idx += 1
    return out


@protected_router.get("/genres", response_model=List[AppGenreOut])
async def list_genres(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db.genres.find()
    out: List[AppGenreOut] = []
    async for doc in cursor:
        out.append(AppGenreOut(
            id=str(doc["_id"]),
            name=doc.get("name", ""),
            icon=doc.get("icon", ""),
            is_adult=doc.get("is_adult", False),
        ))
    return out


# --- Listen count ---

@protected_router.post("/books/{book_id}/listen", status_code=200)
async def record_listen(
    book_id: str,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    # Dedup: check if user has already listened this session (last 30 min)
    now = datetime.utcnow()
    recent = await db.listen_events.find_one({
        "user_id": uid,
        "book_id": book_id,
        "created_at": {"$gte": (now - timedelta(minutes=30)).isoformat()},
    })
    if not recent:
        await db.listen_events.insert_one({
            "user_id": uid,
            "book_id": book_id,
            "created_at": now.isoformat(),
        })
        await db.books.update_one(
            {"_id": ObjectId(book_id)},
            {"$inc": {"listen_count": 1}},
        )
    return {"ok": True}


# --- Rating ---

@protected_router.post("/books/{book_id}/rate", response_model=BookRatingOut)
async def rate_book(
    book_id: str,
    body: RateBookRequest,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    uid = str(user["_id"])
    now = datetime.utcnow().isoformat()
    await db.ratings.update_one(
        {"user_id": uid, "book_id": book_id},
        {"$set": {"rating": body.rating, "updated_at": now}, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    # Recalculate book aggregates
    pipeline = [
        {"$match": {"book_id": book_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "cnt": {"$sum": 1}}},
    ]
    agg = await db.ratings.aggregate(pipeline).to_list(1)
    avg_rating = round(agg[0]["avg"], 1) if agg else 0
    count = agg[0]["cnt"] if agg else 0
    await db.books.update_one(
        {"_id": ObjectId(book_id)},
        {"$set": {"average_rating": avg_rating, "rating_count": count}},
    )
    return BookRatingOut(user_rating=body.rating, average=avg_rating, count=count)


@protected_router.get("/books/{book_id}/rating", response_model=BookRatingOut)
async def get_book_rating(
    book_id: str,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    user_doc = await db.ratings.find_one({"user_id": uid, "book_id": book_id})
    book_doc = await db.books.find_one({"_id": ObjectId(book_id)}, {"average_rating": 1, "rating_count": 1})
    return BookRatingOut(
        user_rating=user_doc["rating"] if user_doc else None,
        average=book_doc.get("average_rating", 0) if book_doc else 0,
        count=book_doc.get("rating_count", 0) if book_doc else 0,
    )


# --- Report ---

@protected_router.post("/books/{book_id}/report", status_code=201)
async def report_book(
    book_id: str,
    body: ReportBookRequest,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    existing = await db.reports.find_one({"user_id": uid, "book_id": book_id})
    if existing:
        raise HTTPException(status_code=409, detail="Already reported")
    await db.reports.insert_one({
        "user_id": uid,
        "book_id": book_id,
        "reason": body.reason,
        "created_at": datetime.utcnow().isoformat(),
    })
    return {"ok": True}


# --- Trending ---

@protected_router.get("/trending", response_model=List[AppBookOut])
async def get_trending(
    languages: Optional[str] = Query(None),
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    lang_ids = None
    if languages:
        lang_ids = [lid.strip() for lid in languages.split(",") if lid.strip()]
    elif user.get("preferred_languages"):
        lang_ids = user["preferred_languages"]

    query: dict = {}
    if lang_ids:
        query["language"] = {"$in": lang_ids}

    trending_docs = await db.trending_lists.find(query).to_list(None)
    is_adult = user.get("is_adult", False)
    book_ids: List[str] = []
    for td in trending_docs:
        book_ids.extend(td.get("book_ids_sfw", td.get("book_ids", [])))
        if is_adult:
            book_ids.extend(td.get("book_ids_adult", []))

    if not book_ids:
        return []

    # Fetch books
    obj_ids = []
    for bid in book_ids:
        try:
            obj_ids.append(ObjectId(bid))
        except Exception:
            pass

    book_query: dict = {"_id": {"$in": obj_ids}, "is_published": True}
    if not user.get("is_adult", False):
        book_query["is_adult"] = False

    author_map = await _build_author_map(db)
    books_out: List[AppBookOut] = []
    async for doc in db.books.find(book_query):
        ch_count = await db.chapters.count_documents({"book_id": str(doc["_id"])})
        books_out.append(_book_doc_to_out(doc, ch_count, author_map))

    # Sort by original order
    id_order = {bid: i for i, bid in enumerate(book_ids)}
    books_out.sort(key=lambda b: id_order.get(b.id, 999))
    return books_out


# --- Editor's Pick ---

@protected_router.get("/editor-pick", response_model=Optional[AppBookOut])
async def get_editor_pick(
    languages: Optional[str] = Query(None),
    include_adult: bool = Query(False),
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    lang_ids = None
    if languages:
        lang_ids = [lid.strip() for lid in languages.split(",") if lid.strip()]
    elif user.get("preferred_languages"):
        lang_ids = user["preferred_languages"]

    query: dict = {}
    if lang_ids:
        query["language"] = {"$in": lang_ids}

    picks = await db.editor_picks.find(query).to_list(None)
    if not picks:
        return None

    pick = picks[0]
    book_id = pick.get("book_id_adult") if include_adult and user.get("is_adult") else pick.get("book_id_sfw")
    if not book_id:
        book_id = pick.get("book_id_sfw")
    if not book_id:
        return None

    try:
        doc = await db.books.find_one({"_id": ObjectId(book_id), "is_published": True})
    except Exception:
        return None
    if not doc:
        return None

    author_map = await _build_author_map(db)
    ch_count = await db.chapters.count_documents({"book_id": str(doc["_id"])})
    return _book_doc_to_out(doc, ch_count, author_map)


# --- Library: likes + progress ---

@protected_router.post("/library/like/{book_id}", response_model=ToggleLikeResponse)
async def toggle_like(
    book_id: str,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    doc = await db.user_library.find_one({"user_id": uid, "book_id": book_id})
    now = datetime.utcnow().isoformat()
    if doc:
        new_liked = not doc.get("liked", False)
        await db.user_library.update_one(
            {"_id": doc["_id"]},
            {"$set": {"liked": new_liked, "updated_at": now}},
        )
        return ToggleLikeResponse(liked=new_liked)
    else:
        await db.user_library.insert_one({
            "user_id": uid,
            "book_id": book_id,
            "liked": True,
            "progress": None,
            "updated_at": now,
        })
        return ToggleLikeResponse(liked=True)


@protected_router.get("/library/liked", response_model=LikedBooksResponse)
async def get_liked_books(
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    cursor = db.user_library.find({"user_id": uid, "liked": True}, {"book_id": 1})
    ids: List[str] = []
    async for doc in cursor:
        ids.append(doc["book_id"])
    return LikedBooksResponse(book_ids=ids)


@protected_router.post("/library/progress/{book_id}", status_code=200)
async def save_progress(
    book_id: str,
    body: ProgressSaveRequest,
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    now = datetime.utcnow().isoformat()
    progress = {
        "chapter_index": body.chapter_index,
        "position": body.position,
        "percent": body.percent,
        "last_played": now,
    }
    await db.user_library.update_one(
        {"user_id": uid, "book_id": book_id},
        {"$set": {"progress": progress, "updated_at": now}, "$setOnInsert": {"liked": False}},
        upsert=True,
    )
    return {"ok": True}


@protected_router.get("/library/progress", response_model=ProgressListResponse)
async def get_all_progress(
    user: dict = Depends(get_current_app_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    uid = str(user["_id"])
    cursor = db.user_library.find(
        {"user_id": uid, "progress": {"$ne": None}},
        {"book_id": 1, "progress": 1},
    )
    entries: List[ProgressEntry] = []
    async for doc in cursor:
        p = doc["progress"]
        entries.append(ProgressEntry(
            book_id=doc["book_id"],
            chapter_index=p.get("chapter_index", 0),
            position=p.get("position", 0),
            percent=p.get("percent", 0),
            last_played=p.get("last_played", ""),
        ))
    return ProgressListResponse(progress=entries)


# ---------------------------------------------------------------------------
# Admin endpoints for trending / editor picks
# ---------------------------------------------------------------------------

admin_trending_router = APIRouter(prefix="/api/v1/admin", tags=["Admin Trending"])


@admin_trending_router.put("/trending/{language_id}")
async def set_trending(
    language_id: str,
    body: TrendingSetRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    now = datetime.utcnow().isoformat()
    await db.trending_lists.update_one(
        {"language": language_id},
        {"$set": {"book_ids_sfw": body.book_ids_sfw, "book_ids_adult": body.book_ids_adult, "updated_at": now}, "$setOnInsert": {"language": language_id}},
        upsert=True,
    )
    return {"ok": True}


@admin_trending_router.get("/trending", response_model=List[TrendingOut])
async def get_all_trending(db: AsyncIOMotorDatabase = Depends(get_db)):
    # Build language name map
    lang_map: dict = {}
    async for doc in db.languages.find({}, {"name": 1}):
        lang_map[str(doc["_id"])] = doc.get("name", "")
    out: List[TrendingOut] = []
    async for doc in db.trending_lists.find():
        out.append(TrendingOut(
            language=doc["language"],
            language_name=lang_map.get(doc["language"], doc["language"]),
            book_ids_sfw=doc.get("book_ids_sfw", doc.get("book_ids", [])),
            book_ids_adult=doc.get("book_ids_adult", []),
            updated_at=doc.get("updated_at", ""),
        ))
    return out


@admin_trending_router.put("/editor-picks/{language_id}")
async def set_editor_pick(
    language_id: str,
    body: EditorPickSetRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    now = datetime.utcnow().isoformat()
    await db.editor_picks.update_one(
        {"language": language_id},
        {"$set": {
            "book_id_sfw": body.book_id_sfw,
            "book_id_adult": body.book_id_adult,
            "updated_at": now,
        }, "$setOnInsert": {"language": language_id}},
        upsert=True,
    )
    return {"ok": True}


@admin_trending_router.get("/editor-picks", response_model=List[EditorPickOut])
async def get_all_editor_picks(db: AsyncIOMotorDatabase = Depends(get_db)):
    lang_map: dict = {}
    async for doc in db.languages.find({}, {"name": 1}):
        lang_map[str(doc["_id"])] = doc.get("name", "")
    out: List[EditorPickOut] = []
    async for doc in db.editor_picks.find():
        out.append(EditorPickOut(
            language=doc["language"],
            language_name=lang_map.get(doc["language"], doc["language"]),
            book_id_sfw=doc.get("book_id_sfw", ""),
            book_id_adult=doc.get("book_id_adult"),
            updated_at=doc.get("updated_at", ""),
        ))
    return out
