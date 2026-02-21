from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from config import UPLOADS_DIR
from db import get_db
from schemas import MixChapterRequest, MixChapterResponse, MixSceneRequest, MixSceneResponse
from services.scene_mixer import mix_chapter, mix_scene

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/mix", tags=["mix"])

# Public router for serving mixed audio files (no auth — loaded by HTML5 Audio)
public_router = APIRouter(prefix="/api/v1/mix", tags=["mix"])


@router.post("", response_model=MixSceneResponse)
async def create_mix(
    req: MixSceneRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        out_path, duration_s, timeline, warnings = await mix_scene(
            req.sceneId, req.elements, db,
        )
        return MixSceneResponse(
            sceneId=req.sceneId,
            status="completed",
            audioUrl=f"/api/v1/mix/{req.sceneId}",
            duration_seconds=duration_s,
            timeline=timeline,
            warnings=warnings or None,
        )
    except ValueError as exc:
        return MixSceneResponse(
            sceneId=req.sceneId,
            status="error",
            error=str(exc),
        )
    except Exception as exc:
        logger.exception("Scene mix failed for %s", req.sceneId)
        return MixSceneResponse(
            sceneId=req.sceneId,
            status="error",
            error=f"Mix failed: {exc}",
        )


@router.post("/chapter", response_model=MixChapterResponse)
async def create_chapter_mix(
    req: MixChapterRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        scenes = [(s.sceneId, s.elements) for s in req.scenes]
        out_path, duration_s, warnings = await mix_chapter(
            req.chapterId, scenes, db,
        )
        return MixChapterResponse(
            chapterId=req.chapterId,
            status="completed",
            audioUrl=f"/api/v1/mix/chapter/{req.chapterId}",
            duration_seconds=duration_s,
            warnings=warnings or None,
        )
    except ValueError as exc:
        return MixChapterResponse(
            chapterId=req.chapterId,
            status="error",
            error=str(exc),
        )
    except Exception as exc:
        logger.exception("Chapter mix failed for %s", req.chapterId)
        return MixChapterResponse(
            chapterId=req.chapterId,
            status="error",
            error=f"Mix failed: {exc}",
        )


@public_router.get("/chapter/{chapter_id}")
async def serve_chapter_mix(chapter_id: str):
    path = UPLOADS_DIR / "mix" / f"chapter_{chapter_id}.wav"
    if not path.exists():
        raise HTTPException(404, "Chapter mix not found")
    return FileResponse(path, media_type="audio/wav", filename=f"chapter_{chapter_id}.wav")


@public_router.get("/{scene_id}")
async def serve_mix(scene_id: str):
    path = UPLOADS_DIR / "mix" / f"{scene_id}.wav"
    if not path.exists():
        raise HTTPException(404, "Mix not found")
    return FileResponse(path, media_type="audio/wav", filename=f"{scene_id}.wav")
