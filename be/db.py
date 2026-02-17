from __future__ import annotations

import logging
import secrets

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import MONGODB_URI, MONGODB_DB

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGODB_URI)
database: AsyncIOMotorDatabase = client[MONGODB_DB]


def get_db() -> AsyncIOMotorDatabase:
    return database


async def init_db() -> None:
    """Create indexes for collections."""
    await database.audio_files.create_index(
        [("description", "text"), ("tags", "text"), ("filename", "text")],
        name="audio_files_text",
    )
    # Admin collections
    await database.languages.create_index("name", unique=True)
    await database.genres.create_index("name", unique=True)
    await database.authors.create_index("name")
    await database.narrators.create_index("name")
    await database.users.create_index("whatsapp_number", unique=True)
    await database.users.create_index("whatsapp_hash", sparse=True)
    # Books & Chapters
    await database.books.create_index("title")
    await database.books.create_index("is_published")
    await database.chapters.create_index("book_id")
    await database.chapters.create_index([("book_id", 1), ("created_at", 1)])
    # Mobile: user library (likes + progress)
    await database.user_library.create_index(
        [("user_id", 1), ("book_id", 1)], unique=True
    )
    await database.user_library.create_index("user_id")
    # Books: tags index
    await database.books.create_index("tags")
    await database.books.create_index("language")
    # Trending lists: one per language
    await database.trending_lists.create_index("language", unique=True)
    # Editor picks: one per language
    await database.editor_picks.create_index("language", unique=True)
    # Ratings: one per user per book
    await database.ratings.create_index(
        [("user_id", 1), ("book_id", 1)], unique=True
    )
    # Reports: one per user per book
    await database.reports.create_index(
        [("user_id", 1), ("book_id", 1)], unique=True
    )
    # User stats
    await database.user_stats.create_index("user_id", unique=True)
    # Dev seed API key — auto-generate once, never overwrite
    await database.api_keys.update_one(
        {"name": "dev_seed"},
        {"$setOnInsert": {"name": "dev_seed", "key": secrets.token_urlsafe(32)}},
        upsert=True,
    )
    doc = await database.api_keys.find_one({"name": "dev_seed"})
    if doc:
        logger.info("Dev seed API key: %s", doc["key"])
