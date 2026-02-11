from __future__ import annotations

from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from services.audio_store import delete_file, get_duration, save_file

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])


class UploadResponse(BaseModel):
    url: Optional[str]
    path: str


CATEGORY_CONFIG = {
    "book_thumbnail": ("public/thumbnails/books", "_thumb"),
    "chapter_thumbnail": ("public/thumbnails/chapters", "_thumb"),
    "book_audio": ("raw/books", "_preview"),
    "chapter_audio": ("raw/chapters", "_audio"),
}

MAX_THUMBNAIL_BYTES = 250 * 1024  # 250 KB
MAX_BOOK_AUDIO_BYTES = 5 * 1024 * 1024  # 5 MB
BOOK_AUDIO_MIN_DURATION = 15.0  # seconds
BOOK_AUDIO_MAX_DURATION = 30.0  # seconds


@router.post("", response_model=UploadResponse)
async def upload_file_endpoint(
    file: UploadFile = File(...),
    category: str = Form(...),
):
    cfg = CATEGORY_CONFIG.get(category)
    if not cfg:
        raise HTTPException(
            400,
            f"Invalid category '{category}'. Must be one of: {', '.join(CATEGORY_CONFIG)}",
        )

    # Size validation before saving
    if "thumbnail" in category:
        await file.seek(0)
        content = await file.read()
        if len(content) > MAX_THUMBNAIL_BYTES:
            raise HTTPException(400, "Thumbnail must be under 250KB")
        await file.seek(0)
    elif category == "book_audio":
        await file.seek(0)
        content = await file.read()
        if len(content) > MAX_BOOK_AUDIO_BYTES:
            raise HTTPException(400, "Preview audio must be under 5MB")
        await file.seek(0)

    subdir, suffix = cfg
    file_id = uuid4().hex[:16]

    rel, _ = await save_file(file, subdir, file_id, "upload", suffix)

    # Duration validation for book audio (after saving, so mutagen can read it)
    if category == "book_audio":
        duration = get_duration(rel)
        if duration is not None:
            if duration < BOOK_AUDIO_MIN_DURATION:
                delete_file(rel)
                raise HTTPException(400, f"Preview audio too short ({duration:.1f}s). Minimum is {BOOK_AUDIO_MIN_DURATION:.0f}s")
            if duration > BOOK_AUDIO_MAX_DURATION:
                delete_file(rel)
                raise HTTPException(400, f"Preview audio too long ({duration:.1f}s). Maximum is {BOOK_AUDIO_MAX_DURATION:.0f}s")

    url = None
    if "thumbnail" in category:
        url = f"/cdn/{rel.removeprefix('public/')}"

    return UploadResponse(url=url, path=rel)
