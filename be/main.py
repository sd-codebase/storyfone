from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, UPLOADS_DIR
from db import init_db
from routers import admin, audio_library, auth, books, chapters, dialogue, projects, scene_mix, upload
from services.auth import get_current_user

# Ensure public CDN directory exists before StaticFiles instantiation
_cdn_dir = UPLOADS_DIR / "public"
_cdn_dir.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Storyfone", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth router — no auth required
app.include_router(auth.router)

# Protected routers — require valid JWT
protected = [Depends(get_current_user)]
app.include_router(audio_library.router, dependencies=protected)
app.include_router(dialogue.router, dependencies=protected)
app.include_router(projects.router, dependencies=protected)
app.include_router(scene_mix.router, dependencies=protected)
app.include_router(admin.languages_router, dependencies=protected)
app.include_router(admin.genres_router, dependencies=protected)
app.include_router(admin.authors_router, dependencies=protected)
app.include_router(admin.narrators_router, dependencies=protected)
app.include_router(admin.users_router, dependencies=protected)
app.include_router(admin.otp_router, dependencies=protected)
app.include_router(books.router, dependencies=protected)
app.include_router(chapters.router, dependencies=protected)
app.include_router(upload.router, dependencies=protected)

# Static CDN mount — no auth, placed after routers so API routes take priority
app.mount("/cdn", StaticFiles(directory=str(_cdn_dir)), name="cdn")


@app.get("/health")
async def health():
    return {"status": "ok"}
