from __future__ import annotations

import mimetypes
import re
import shutil
from pathlib import Path
from typing import Optional, Tuple

import aiofiles
from fastapi import UploadFile
from mutagen import File as MutagenFile

from config import UPLOADS_DIR


def ensure_dirs():
    for sub in ("sfx", "bgm", "tts", "mix"):
        (UPLOADS_DIR / sub).mkdir(parents=True, exist_ok=True)


def slugify(name: str) -> str:
    """Lowercase, replace spaces/special chars with hyphens, strip edges."""
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s-]+", "-", s)
    return s.strip("-")


async def save_file(
    file: UploadFile,
    subdir: str,
    file_id: str,
    name: str,
    suffix: str = "",
) -> Tuple[str, int]:
    """Save an uploaded file to UPLOADS_DIR/{subdir}/{id}-{slug}{suffix}{ext}.

    Returns (rel_path, file_size).
    """
    ext = Path(file.filename or "").suffix
    slug = slugify(name)
    filename = f"{file_id}-{slug}{suffix}{ext}"
    dest_dir = UPLOADS_DIR / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    rel_path = f"{subdir}/{filename}"
    full_path = UPLOADS_DIR / rel_path

    await file.seek(0)
    size = 0
    async with aiofiles.open(full_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1 MB chunks
            await f.write(chunk)
            size += len(chunk)

    return rel_path, size


def delete_directory(rel_dir: str) -> bool:
    """Remove an entire directory under UPLOADS_DIR. Returns True if removed."""
    full_path = UPLOADS_DIR / rel_dir
    if full_path.exists() and full_path.is_dir():
        shutil.rmtree(full_path)
        return True
    return False


async def save_upload(file: UploadFile, category: str, file_id: str) -> Tuple[str, int]:
    """Save uploaded file to disk. Returns (stored_path, file_size)."""
    ensure_dirs()
    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    rel_path = f"{category}/{file_id}_{safe_name}"
    full_path = UPLOADS_DIR / rel_path

    await file.seek(0)
    size = 0
    async with aiofiles.open(full_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1 MB chunks
            await f.write(chunk)
            size += len(chunk)

    return rel_path, size


def get_duration(stored_path: str) -> Optional[float]:
    """Extract audio duration using mutagen. Returns None on failure."""
    full_path = UPLOADS_DIR / stored_path
    try:
        audio = MutagenFile(str(full_path))
        if audio and audio.info:
            return round(audio.info.length, 2)
    except Exception:
        pass
    return None


def get_mime_type(filename: str) -> str:
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"


def get_full_path(stored_path: str) -> Path:
    return UPLOADS_DIR / stored_path


def delete_file(stored_path: str) -> bool:
    full_path = UPLOADS_DIR / stored_path
    if full_path.exists():
        full_path.unlink()
        return True
    return False
