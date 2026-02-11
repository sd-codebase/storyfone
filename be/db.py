from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import MONGODB_URI, MONGODB_DB

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
    # Books & Chapters
    await database.books.create_index("title")
    await database.books.create_index("is_published")
    await database.chapters.create_index("book_id")
    await database.chapters.create_index([("book_id", 1), ("created_at", 1)])
