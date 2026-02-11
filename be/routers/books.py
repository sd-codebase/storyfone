import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Form, HTTPException

from config import UPLOADS_DIR
from db import get_db
from schemas import BookOut
from services.audio_store import delete_directory, delete_file, slugify
from services.hls import process_audio_to_hls

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/books", tags=["admin-books"])


def _doc_to_out(doc: dict) -> BookOut:
    return BookOut(
        id=str(doc["_id"]),
        title=doc.get("title", ""),
        authors=doc.get("authors", []),
        narrators=doc.get("narrators", []),
        language=doc.get("language"),
        genres=doc.get("genres", []),
        description=doc.get("description", ""),
        is_published=doc.get("is_published", False),
        is_adult=doc.get("is_adult", False),
        thumbnail_url=doc.get("thumbnail_url"),
        preview_audio_raw=doc.get("preview_audio_raw"),
        preview_audio_hls=doc.get("preview_audio_hls"),
        audio_status=doc.get("audio_status", "draft"),
        created_at=doc.get("created_at", ""),
        updated_at=doc.get("updated_at", ""),
    )


@router.get("", response_model=List[BookOut])
async def list_books():
    db = get_db()
    docs = await db.books.find().sort("created_at", -1).to_list(1000)
    return [_doc_to_out(d) for d in docs]


@router.get("/{id}", response_model=BookOut)
async def get_book(id: str):
    db = get_db()
    doc = await db.books.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Book not found")
    return _doc_to_out(doc)


@router.post("", response_model=BookOut)
async def create_book(
    title: str = Form(...),
    authors: str = Form("[]"),
    narrators: str = Form("[]"),
    language: Optional[str] = Form(None),
    genres: str = Form("[]"),
    description: str = Form(""),
    is_adult: bool = Form(False),
    thumbnail_url: Optional[str] = Form(None),
    preview_audio_raw: Optional[str] = Form(None),
):
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    oid = ObjectId()

    doc = {
        "_id": oid,
        "title": title,
        "authors": json.loads(authors),
        "narrators": json.loads(narrators),
        "language": language,
        "genres": json.loads(genres),
        "description": description,
        "is_published": False,
        "is_adult": is_adult,
        "thumbnail_url": thumbnail_url,
        "preview_audio_raw": preview_audio_raw,
        "preview_audio_hls": None,
        "audio_status": "draft",
        "created_at": now,
        "updated_at": now,
    }

    await db.books.insert_one(doc)
    return _doc_to_out(doc)


@router.put("/{id}", response_model=BookOut)
async def update_book(
    id: str,
    title: Optional[str] = Form(None),
    authors: Optional[str] = Form(None),
    narrators: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    genres: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_adult: Optional[bool] = Form(None),
    thumbnail_url: Optional[str] = Form(None),
    preview_audio_raw: Optional[str] = Form(None),
):
    db = get_db()
    doc = await db.books.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Book not found")

    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if title is not None:
        updates["title"] = title
    if authors is not None:
        updates["authors"] = json.loads(authors)
    if narrators is not None:
        updates["narrators"] = json.loads(narrators)
    if language is not None:
        updates["language"] = language
    if genres is not None:
        updates["genres"] = json.loads(genres)
    if description is not None:
        updates["description"] = description
    if is_adult is not None:
        updates["is_adult"] = is_adult

    if thumbnail_url is not None:
        if doc.get("thumbnail_url"):
            delete_file("public" + doc["thumbnail_url"].removeprefix("/cdn"))
        updates["thumbnail_url"] = thumbnail_url

    if preview_audio_raw is not None:
        if doc.get("preview_audio_raw"):
            delete_file(doc["preview_audio_raw"])
        updates["preview_audio_raw"] = preview_audio_raw
        updates["audio_status"] = "draft"
        updates["preview_audio_hls"] = None
        current_title = updates.get("title", doc["title"])
        file_id = str(doc["_id"])
        slug = slugify(current_title)
        delete_directory(f"public/hls/books/{file_id}-{slug}")

    await db.books.update_one({"_id": ObjectId(id)}, {"$set": updates})
    updated = await db.books.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)


@router.delete("/{id}")
async def delete_book(id: str):
    db = get_db()
    doc = await db.books.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Book not found")

    file_id = str(doc["_id"])
    slug = slugify(doc.get("title", ""))

    # Delete book files
    if doc.get("thumbnail_url"):
        delete_file("public" + doc["thumbnail_url"].removeprefix("/cdn"))
    if doc.get("preview_audio_raw"):
        delete_file(doc["preview_audio_raw"])
    delete_directory(f"public/hls/books/{file_id}-{slug}")

    # Cascade delete chapters + their files
    chapters = await db.chapters.find({"book_id": id}).to_list(1000)
    for ch in chapters:
        ch_id = str(ch["_id"])
        ch_slug = slugify(ch.get("name", ""))
        if ch.get("thumbnail_url"):
            delete_file("public" + ch["thumbnail_url"].removeprefix("/cdn"))
        if ch.get("audio_raw"):
            delete_file(ch["audio_raw"])
        delete_directory(f"public/hls/chapters/{ch_id}-{ch_slug}")
    await db.chapters.delete_many({"book_id": id})

    await db.books.delete_one({"_id": ObjectId(id)})
    return {"ok": True}


@router.post("/{id}/process-audio", response_model=BookOut)
async def process_book_audio(id: str):
    db = get_db()
    doc = await db.books.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Book not found")
    if not doc.get("preview_audio_raw"):
        raise HTTPException(400, "No preview audio to process")

    file_id = str(doc["_id"])
    slug = slugify(doc["title"])
    input_path = UPLOADS_DIR / doc["preview_audio_raw"]
    output_dir = UPLOADS_DIR / f"public/hls/books/{file_id}-{slug}"

    await db.books.update_one(
        {"_id": ObjectId(id)}, {"$set": {"audio_status": "processing"}}
    )

    success = await process_audio_to_hls(input_path, output_dir)

    if success:
        hls_url = f"/cdn/hls/books/{file_id}-{slug}/playlist.m3u8"
        await db.books.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"audio_status": "processed", "preview_audio_hls": hls_url}},
        )
    else:
        await db.books.update_one(
            {"_id": ObjectId(id)}, {"$set": {"audio_status": "error"}}
        )

    updated = await db.books.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)


@router.put("/{id}/publish", response_model=BookOut)
async def publish_book(id: str):
    db = get_db()
    doc = await db.books.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Book not found")

    published_count = await db.chapters.count_documents(
        {"book_id": id, "is_published": True}
    )
    if published_count == 0:
        raise HTTPException(400, "At least one published chapter is required")

    await db.books.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_published": True, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    updated = await db.books.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)


@router.put("/{id}/unpublish", response_model=BookOut)
async def unpublish_book(id: str):
    db = get_db()
    doc = await db.books.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(404, "Book not found")

    await db.books.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_published": False, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    updated = await db.books.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)
