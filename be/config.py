from __future__ import annotations

from pathlib import Path
from typing import List

from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_TTS_MODEL: str = os.getenv("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB: str = os.getenv("MONGODB_DB", "story-narration")
UPLOADS_DIR: Path = Path(os.getenv("UPLOADS_DIR", "./uploads"))
CORS_ORIGINS: List[str] = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
]

ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
JWT_SECRET: str = os.getenv("JWT_SECRET", "")
JWT_EXPIRE_DAYS: int = int(os.getenv("JWT_EXPIRE_DAYS", "30"))

ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")

ENV: str = os.getenv("ENV", "development")
IS_DEV: bool = ENV == "development"
