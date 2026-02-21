from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException

from schemas import (
    ProcessDialogueRequest,
    ProcessDialogueResponse,
    BatchProcessRequest,
    BatchProcessResponse,
)
from services.tts import generate_speech

router = APIRouter(prefix="/api/v1/dialogue", tags=["dialogue"])

# Public router for serving audio files (no auth required — loaded by HTML5 Audio / WaveSurfer)
public_router = APIRouter(prefix="/api/v1/dialogue", tags=["dialogue"])


@router.post("/process", response_model=ProcessDialogueResponse)
async def process_dialogue(req: ProcessDialogueRequest):
    try:
        await generate_speech(
            dialogue_text=req.dialogueText,
            speakers=req.speakers,
            dialogue_id=req.dialogueId,
            stage_direction=req.stageDirection,
            character_name=req.characterName,
            language=req.language,
        )
        return ProcessDialogueResponse(
            dialogueId=req.dialogueId,
            status="completed",
            audioUrl=f"/api/v1/dialogue/tts/{req.dialogueId}",
        )
    except Exception as exc:
        return ProcessDialogueResponse(
            dialogueId=req.dialogueId,
            status="error",
            error=str(exc),
        )


@router.post("/batch", response_model=BatchProcessResponse)
async def batch_process(req: BatchProcessRequest):
    results: List[ProcessDialogueResponse] = []
    for dialogue in req.dialogues:
        try:
            await generate_speech(
                dialogue_text=dialogue.dialogueText,
                speakers=dialogue.speakers,
                dialogue_id=dialogue.dialogueId,
                stage_direction=dialogue.stageDirection,
                character_name=dialogue.characterName,
                language=dialogue.language,
            )
            results.append(ProcessDialogueResponse(
                dialogueId=dialogue.dialogueId,
                status="completed",
                audioUrl=f"/api/v1/dialogue/tts/{dialogue.dialogueId}",
            ))
        except Exception as exc:
            results.append(ProcessDialogueResponse(
                dialogueId=dialogue.dialogueId,
                status="error",
                error=str(exc),
            ))
    return BatchProcessResponse(results=results)


@public_router.get("/tts/{dialogue_id}")
async def serve_tts(dialogue_id: str):
    from config import UPLOADS_DIR
    from fastapi.responses import FileResponse

    path = UPLOADS_DIR / "tts" / f"{dialogue_id}.wav"
    if not path.exists():
        raise HTTPException(404, "TTS audio not found")
    return FileResponse(path, media_type="audio/wav")
