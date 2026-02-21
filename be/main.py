from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, IS_DEV, UPLOADS_DIR
from db import init_db
from routers import admin, audio_library, auth, books, chapters, dialogue, mobile, projects, scene_mix, upload
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

# Auth routers — no auth required
app.include_router(auth.router)
app.include_router(mobile.auth_router)

# Public file-serving routers — no auth (loaded by HTML5 Audio / WaveSurfer)
app.include_router(dialogue.public_router)
app.include_router(audio_library.public_router)
app.include_router(scene_mix.public_router)

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
app.include_router(admin.reports_router, dependencies=protected)
app.include_router(books.router, dependencies=protected)
app.include_router(chapters.router, dependencies=protected)
app.include_router(upload.router, dependencies=protected)

# Mobile app protected routes (JWT = user_id)
app.include_router(mobile.protected_router)

# Admin trending & editor picks
app.include_router(mobile.admin_trending_router, dependencies=protected)

# Dev-only seed routes (no auth, only registered when running against localhost)
if IS_DEV:
    from routers import dev_seed
    app.include_router(dev_seed.router)

# Static CDN mount — no auth, placed after routers so API routes take priority
app.mount("/cdn", StaticFiles(directory=str(_cdn_dir)), name="cdn")


@app.get("/health")
async def health():
    return {"status": "ok"}
