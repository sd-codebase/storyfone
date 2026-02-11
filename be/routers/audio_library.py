from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from nanoid import generate as nanoid

from db import get_db
from schemas import AudioFileOut, AudioSearchResult
from services.audio_store import (
    save_upload,
    get_duration,
    get_mime_type,
    get_full_path,
    delete_file,
)

router = APIRouter(prefix="/api/v1/audio", tags=["audio"])


@router.post("/upload", response_model=AudioFileOut)
async def upload_audio(
    file: UploadFile = File(...),
    category: str = Form(...),
    description: str = Form(""),
    tags: str = Form(""),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if category not in ("sfx", "bgm"):
        raise HTTPException(400, "category must be 'sfx' or 'bgm'")

    file_id = nanoid()
    stored_path, file_size = await save_upload(file, category, file_id)
    duration = get_duration(stored_path)
    mime = get_mime_type(file.filename or "unknown")

    # Store tags as array in MongoDB
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []

    doc = {
        "_id": file_id,
        "filename": file.filename or "unknown",
        "stored_path": stored_path,
        "category": category,
        "description": description,
        "tags": tags_list,
        "duration_seconds": duration,
        "file_size": file_size,
        "mime_type": mime,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.audio_files.insert_one(doc)

    return _doc_to_out(doc)


@router.get("/search", response_model=AudioSearchResult)
async def search_audio(
    q: str,
    category: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    query: dict = {"$text": {"$search": q}}
    if category:
        query["category"] = category

    cursor = db.audio_files.find(
        query, {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})])

    docs = await cursor.to_list(length=200)

    return AudioSearchResult(
        results=[_doc_to_out(d) for d in docs],
        total=len(docs),
    )


@router.get("", response_model=list[AudioFileOut])
async def list_audio(
    category: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    query: dict = {}
    if category:
        query["category"] = category
    cursor = db.audio_files.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=500)
    return [_doc_to_out(d) for d in docs]


@router.get("/{file_id}", response_model=AudioFileOut)
async def get_audio(file_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = await db.audio_files.find_one({"_id": file_id})
    if not doc:
        raise HTTPException(404, "Audio file not found")
    return _doc_to_out(doc)


@router.get("/{file_id}/file")
async def serve_audio(file_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = await db.audio_files.find_one({"_id": file_id})
    if not doc:
        raise HTTPException(404, "Audio file not found")

    path = get_full_path(doc["stored_path"])
    if not path.exists():
        raise HTTPException(404, "File missing from disk")

    return FileResponse(path, media_type=doc["mime_type"], filename=doc["filename"])


@router.delete("/{file_id}")
async def delete_audio(file_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = await db.audio_files.find_one({"_id": file_id})
    if not doc:
        raise HTTPException(404, "Audio file not found")

    delete_file(doc["stored_path"])
    await db.audio_files.delete_one({"_id": file_id})

    return {"ok": True}


# --- helpers ---

def _doc_to_out(doc: dict) -> AudioFileOut:
    tags = doc.get("tags", [])
    tags_str = ", ".join(tags) if isinstance(tags, list) else tags
    return AudioFileOut(
        id=doc["_id"],
        filename=doc["filename"],
        stored_path=doc["stored_path"],
        category=doc["category"],
        description=doc.get("description", ""),
        tags=tags_str,
        duration_seconds=doc.get("duration_seconds"),
        file_size=doc["file_size"],
        mime_type=doc.get("mime_type", "audio/wav"),
        created_at=doc["created_at"],
    )
