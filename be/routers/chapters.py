import logging
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Form, HTTPException

from config import UPLOADS_DIR
from db import get_db
from schemas import ChapterOut
from services.audio_store import delete_directory, delete_file, slugify
from services.hls import process_audio_to_hls

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/admin/books/{book_id}/chapters", tags=["admin-chapters"]
)


def _doc_to_out(doc: dict) -> ChapterOut:
    return ChapterOut(
        id=str(doc["_id"]),
        name=doc.get("name", ""),
        book_id=doc.get("book_id", ""),
        status=doc.get("status", "draft"),
        is_published=doc.get("is_published", False),
        thumbnail_url=doc.get("thumbnail_url"),
        audio_raw=doc.get("audio_raw"),
        audio_hls=doc.get("audio_hls"),
        created_at=doc.get("created_at", ""),
        updated_at=doc.get("updated_at", ""),
    )


@router.get("", response_model=List[ChapterOut])
async def list_chapters(book_id: str):
    db = get_db()
    docs = await db.chapters.find({"book_id": book_id}).sort("created_at", 1).to_list(1000)
    return [_doc_to_out(d) for d in docs]


@router.get("/{id}", response_model=ChapterOut)
async def get_chapter(book_id: str, id: str):
    db = get_db()
    doc = await db.chapters.find_one({"_id": ObjectId(id), "book_id": book_id})
    if not doc:
        raise HTTPException(404, "Chapter not found")
    return _doc_to_out(doc)


@router.post("", response_model=ChapterOut)
async def create_chapter(
    book_id: str,
    name: str = Form(...),
    thumbnail_url: Optional[str] = Form(None),
    audio_raw: Optional[str] = Form(None),
):
    db = get_db()
    book = await db.books.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(404, "Book not found")

    now = datetime.now(timezone.utc).isoformat()
    oid = ObjectId()

    doc = {
        "_id": oid,
        "name": name,
        "book_id": book_id,
        "status": "draft",
        "is_published": False,
        "thumbnail_url": thumbnail_url,
        "audio_raw": audio_raw,
        "audio_hls": None,
        "created_at": now,
        "updated_at": now,
    }

    await db.chapters.insert_one(doc)
    return _doc_to_out(doc)


@router.put("/{id}", response_model=ChapterOut)
async def update_chapter(
    book_id: str,
    id: str,
    name: Optional[str] = Form(None),
    thumbnail_url: Optional[str] = Form(None),
    audio_raw: Optional[str] = Form(None),
):
    db = get_db()
    doc = await db.chapters.find_one({"_id": ObjectId(id), "book_id": book_id})
    if not doc:
        raise HTTPException(404, "Chapter not found")

    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if name is not None:
        updates["name"] = name

    if thumbnail_url is not None:
        if doc.get("thumbnail_url"):
            delete_file("public" + doc["thumbnail_url"].removeprefix("/cdn"))
        updates["thumbnail_url"] = thumbnail_url

    if audio_raw is not None:
        if doc.get("audio_raw"):
            delete_file(doc["audio_raw"])
        updates["audio_raw"] = audio_raw
        updates["status"] = "draft"
        updates["audio_hls"] = None
        current_name = updates.get("name", doc["name"])
        file_id = str(doc["_id"])
        slug = slugify(current_name)
        delete_directory(f"public/hls/chapters/{file_id}-{slug}")

    await db.chapters.update_one({"_id": ObjectId(id)}, {"$set": updates})
    updated = await db.chapters.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)


@router.delete("/{id}")
async def delete_chapter(book_id: str, id: str):
    db = get_db()
    doc = await db.chapters.find_one({"_id": ObjectId(id), "book_id": book_id})
    if not doc:
        raise HTTPException(404, "Chapter not found")

    file_id = str(doc["_id"])
    slug = slugify(doc.get("name", ""))

    if doc.get("thumbnail_url"):
        delete_file("public" + doc["thumbnail_url"].removeprefix("/cdn"))
    if doc.get("audio_raw"):
        delete_file(doc["audio_raw"])
    delete_directory(f"public/hls/chapters/{file_id}-{slug}")

    await db.chapters.delete_one({"_id": ObjectId(id)})
    return {"ok": True}


@router.post("/{id}/process-audio", response_model=ChapterOut)
async def process_chapter_audio(book_id: str, id: str):
    db = get_db()
    doc = await db.chapters.find_one({"_id": ObjectId(id), "book_id": book_id})
    if not doc:
        raise HTTPException(404, "Chapter not found")
    if not doc.get("audio_raw"):
        raise HTTPException(400, "No audio to process")

    file_id = str(doc["_id"])
    slug = slugify(doc["name"])
    input_path = UPLOADS_DIR / doc["audio_raw"]
    output_dir = UPLOADS_DIR / f"public/hls/chapters/{file_id}-{slug}"

    await db.chapters.update_one(
        {"_id": ObjectId(id)}, {"$set": {"status": "processing"}}
    )

    success = await process_audio_to_hls(input_path, output_dir)

    if success:
        hls_url = f"/cdn/hls/chapters/{file_id}-{slug}/playlist.m3u8"
        await db.chapters.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": "processed", "audio_hls": hls_url}},
        )
    else:
        await db.chapters.update_one(
            {"_id": ObjectId(id)}, {"$set": {"status": "error"}}
        )

    updated = await db.chapters.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)


@router.put("/{id}/publish", response_model=ChapterOut)
async def publish_chapter(book_id: str, id: str):
    db = get_db()
    doc = await db.chapters.find_one({"_id": ObjectId(id), "book_id": book_id})
    if not doc:
        raise HTTPException(404, "Chapter not found")
    if doc.get("status") != "processed":
        raise HTTPException(400, "Audio must be processed before publishing")

    await db.chapters.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_published": True, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    updated = await db.chapters.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)


@router.put("/{id}/unpublish", response_model=ChapterOut)
async def unpublish_chapter(book_id: str, id: str):
    db = get_db()
    doc = await db.chapters.find_one({"_id": ObjectId(id), "book_id": book_id})
    if not doc:
        raise HTTPException(404, "Chapter not found")

    await db.chapters.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_published": False, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    updated = await db.chapters.find_one({"_id": ObjectId(id)})
    return _doc_to_out(updated)
