from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from functools import partial
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from pydub import AudioSegment

from config import UPLOADS_DIR
from schemas import AudioTimingIn, SceneElementIn, TimelineEntry
from services.audio_store import ensure_dirs

logger = logging.getLogger(__name__)

# --- Volume constants (dB) ---
VOLUME_DIALOGUE = 0
VOLUME_SFX = -3
VOLUME_BGM_BASE = -10
VOLUME_BGM_DUCKED = -20  # base + additional -10 dB

# --- Overlap constants (ms) ---
SFX_OVERLAP_MS = 500
BGM_ADVANCE_MS = 750

# Standard output format
SAMPLE_RATE = 44100
CHANNELS = 2
SAMPLE_WIDTH = 2  # 16-bit


@dataclass
class PlacedClip:
    id: str
    type: str
    label: str
    audio: AudioSegment
    start_ms: int
    volume_db: float


@dataclass
class TimeRange:
    start_ms: int
    end_ms: int


# ---------------------------------------------------------------------------
# Path resolution (async — needs DB)
# ---------------------------------------------------------------------------

async def _resolve_all_paths(
    elements: List[SceneElementIn],
    db: object,
) -> Dict[str, Optional[Path]]:
    """Resolve each element to its audio file path on disk."""
    paths: Dict[str, Optional[Path]] = {}

    for el in elements:
        if el.type == "PAUSE":
            paths[el.id] = None
            continue

        if el.type in ("SFX", "BGM"):
            if not el.audioFileId:
                paths[el.id] = None
                continue
            doc = await db.audio_files.find_one({"_id": el.audioFileId})
            if doc and doc.get("stored_path"):
                p = UPLOADS_DIR / doc["stored_path"]
                paths[el.id] = p if p.exists() else None
            else:
                paths[el.id] = None

        elif el.type == "DIALOGUE":
            if not el.audioUrl:
                paths[el.id] = None
                continue
            p = UPLOADS_DIR / "tts" / f"{el.audioUrl}.wav"
            paths[el.id] = p if p.exists() else None

        else:
            paths[el.id] = None

    return paths


# ---------------------------------------------------------------------------
# Clip processing (sync)
# ---------------------------------------------------------------------------

def _normalize_format(seg: AudioSegment) -> AudioSegment:
    """Normalize to 44.1 kHz stereo 16-bit."""
    return seg.set_frame_rate(SAMPLE_RATE).set_channels(CHANNELS).set_sample_width(SAMPLE_WIDTH)


def _process_clip(
    raw: AudioSegment,
    timing: Optional[AudioTimingIn],
    loop: bool = True,
) -> AudioSegment:
    """Apply trim_start, duration (with optional looping), fade_in, fade_out."""
    seg = _normalize_format(raw)

    if not timing:
        return seg

    # Trim start
    if timing.trim_start and timing.trim_start > 0:
        trim_ms = int(timing.trim_start * 1000)
        seg = seg[trim_ms:]

    # Duration (truncate; loop only if allowed)
    if timing.duration and timing.duration > 0:
        target_ms = int(timing.duration * 1000)
        if loop and len(seg) < target_ms:
            loops_needed = (target_ms // len(seg)) + 1
            seg = seg * loops_needed
        seg = seg[:target_ms]

    # Fades
    if timing.fade_in and timing.fade_in > 0:
        seg = seg.fade_in(int(timing.fade_in * 1000))
    if timing.fade_out and timing.fade_out > 0:
        seg = seg.fade_out(int(timing.fade_out * 1000))

    return seg


# ---------------------------------------------------------------------------
# Timeline building (sync)
# ---------------------------------------------------------------------------

def _build_timeline_sync(
    elements: List[SceneElementIn],
    resolved_paths: Dict[str, Optional[Path]],
) -> Tuple[List[PlacedClip], List[TimelineEntry], List[str]]:
    """Walk sorted elements, load audio, compute absolute positions."""
    sorted_els = sorted(elements, key=lambda e: e.order)
    placed: List[PlacedClip] = []
    timeline: List[TimelineEntry] = []
    warnings: List[str] = []
    cursor_ms = 0

    for el in sorted_els:
        if el.type == "PAUSE":
            pause_ms = int((el.duration or 1.0) * 1000)
            timeline.append(TimelineEntry(
                id=el.id,
                type="PAUSE",
                label=f"Pause {el.duration or 1.0}s",
                start_s=round(cursor_ms / 1000, 3),
                end_s=round((cursor_ms + pause_ms) / 1000, 3),
            ))
            cursor_ms += pause_ms
            continue

        path = resolved_paths.get(el.id)
        if path is None:
            label = el.description or el.dialogueText or el.id
            warnings.append(f"Skipped {el.type} '{label}': audio file not found")
            continue

        try:
            raw = AudioSegment.from_file(str(path))
        except Exception as exc:
            warnings.append(f"Failed to load {el.type} '{el.id}': {exc}")
            continue

        seg = _process_clip(raw, el.timing, loop=(el.type != "BGM"))

        if el.type == "DIALOGUE":
            start_ms = cursor_ms
            placed.append(PlacedClip(
                id=el.id,
                type="DIALOGUE",
                label=f"{el.characterName or '?'}: {(el.dialogueText or '')[:40]}",
                audio=seg,
                start_ms=start_ms,
                volume_db=VOLUME_DIALOGUE,
            ))
            timeline.append(TimelineEntry(
                id=el.id,
                type="DIALOGUE",
                label=f"{el.characterName or '?'}: {(el.dialogueText or '')[:40]}",
                start_s=round(start_ms / 1000, 3),
                end_s=round((start_ms + len(seg)) / 1000, 3),
            ))
            cursor_ms += len(seg)

        elif el.type == "SFX":
            start_ms = max(0, cursor_ms - SFX_OVERLAP_MS)
            placed.append(PlacedClip(
                id=el.id,
                type="SFX",
                label=el.description or "SFX",
                audio=seg,
                start_ms=start_ms,
                volume_db=VOLUME_SFX,
            ))
            timeline.append(TimelineEntry(
                id=el.id,
                type="SFX",
                label=el.description or "SFX",
                start_s=round(start_ms / 1000, 3),
                end_s=round((start_ms + len(seg)) / 1000, 3),
            ))
            cursor_ms = max(cursor_ms, start_ms + len(seg) - SFX_OVERLAP_MS)

        elif el.type == "BGM":
            start_ms = cursor_ms
            # Default 1s fade-in/fade-out for BGM if not user-configured
            has_fade_in = el.timing and el.timing.fade_in and el.timing.fade_in > 0
            has_fade_out = el.timing and el.timing.fade_out and el.timing.fade_out > 0
            if not has_fade_in:
                seg = seg.fade_in(min(1000, len(seg)))
            if not has_fade_out:
                seg = seg.fade_out(min(1000, len(seg)))
            placed.append(PlacedClip(
                id=el.id,
                type="BGM",
                label=el.description or "BGM",
                audio=seg,
                start_ms=start_ms,
                volume_db=VOLUME_BGM_BASE,
            ))
            timeline.append(TimelineEntry(
                id=el.id,
                type="BGM",
                label=el.description or "BGM",
                start_s=round(start_ms / 1000, 3),
                end_s=round((start_ms + len(seg)) / 1000, 3),
            ))
            cursor_ms += BGM_ADVANCE_MS

    return placed, timeline, warnings


# ---------------------------------------------------------------------------
# Ducking helpers
# ---------------------------------------------------------------------------

def _merge_ranges(ranges: List[TimeRange]) -> List[TimeRange]:
    """Merge overlapping time ranges."""
    if not ranges:
        return []
    sorted_r = sorted(ranges, key=lambda r: r.start_ms)
    merged = [TimeRange(sorted_r[0].start_ms, sorted_r[0].end_ms)]
    for r in sorted_r[1:]:
        if r.start_ms <= merged[-1].end_ms:
            merged[-1].end_ms = max(merged[-1].end_ms, r.end_ms)
        else:
            merged.append(TimeRange(r.start_ms, r.end_ms))
    return merged


def _apply_ducking(placed_clips: List[PlacedClip]) -> List[PlacedClip]:
    """Apply ducking to BGM clips where foreground (DIALOGUE/SFX) is active."""
    # Collect foreground regions
    fg_ranges: List[TimeRange] = []
    for clip in placed_clips:
        if clip.type in ("DIALOGUE", "SFX"):
            fg_ranges.append(TimeRange(clip.start_ms, clip.start_ms + len(clip.audio)))
    fg_merged = _merge_ranges(fg_ranges)

    if not fg_merged:
        return placed_clips

    result: List[PlacedClip] = []
    for clip in placed_clips:
        if clip.type != "BGM":
            result.append(clip)
            continue

        clip_start = clip.start_ms
        clip_end = clip.start_ms + len(clip.audio)

        # Find overlapping foreground regions
        duck_regions: List[TimeRange] = []
        for fg in fg_merged:
            ov_start = max(clip_start, fg.start_ms)
            ov_end = min(clip_end, fg.end_ms)
            if ov_start < ov_end:
                duck_regions.append(TimeRange(ov_start, ov_end))

        if not duck_regions:
            result.append(clip)
            continue

        # Slice BGM at duck boundaries and reassemble
        segments: List[AudioSegment] = []
        pos = clip_start
        for dr in duck_regions:
            # Non-ducked segment before this duck region
            if pos < dr.start_ms:
                seg_slice = clip.audio[pos - clip_start:dr.start_ms - clip_start]
                segments.append(seg_slice)
            # Ducked segment
            ducked_slice = clip.audio[dr.start_ms - clip_start:dr.end_ms - clip_start]
            additional_duck = VOLUME_BGM_DUCKED - VOLUME_BGM_BASE  # -10 dB additional
            ducked_slice = ducked_slice + additional_duck
            segments.append(ducked_slice)
            pos = dr.end_ms

        # Trailing non-ducked segment
        if pos < clip_end:
            segments.append(clip.audio[pos - clip_start:clip_end - clip_start])

        # Reassemble
        reassembled = segments[0]
        for s in segments[1:]:
            reassembled = reassembled + s

        result.append(PlacedClip(
            id=clip.id,
            type=clip.type,
            label=clip.label,
            audio=reassembled,
            start_ms=clip.start_ms,
            volume_db=clip.volume_db,
        ))

    return result


# ---------------------------------------------------------------------------
# Mixdown
# ---------------------------------------------------------------------------

def _mixdown(placed_clips: List[PlacedClip]) -> AudioSegment:
    """Create silent canvas and overlay each clip at its position with its volume."""
    if not placed_clips:
        raise ValueError("No audio clips to mix")

    total_ms = max(clip.start_ms + len(clip.audio) for clip in placed_clips)
    canvas = AudioSegment.silent(duration=total_ms, frame_rate=SAMPLE_RATE)
    canvas = _normalize_format(canvas)

    for clip in placed_clips:
        adjusted = clip.audio + clip.volume_db
        canvas = canvas.overlay(adjusted, position=clip.start_ms)

    return canvas


# ---------------------------------------------------------------------------
# Sync work bundle (runs in executor)
# ---------------------------------------------------------------------------

def _sync_work(
    elements: List[SceneElementIn],
    resolved_paths: Dict[str, Optional[Path]],
    scene_id: str,
) -> Tuple[Path, float, List[TimelineEntry], List[str]]:
    """All CPU-bound pydub work in one function for run_in_executor."""
    placed, timeline, warnings = _build_timeline_sync(elements, resolved_paths)

    if not placed:
        raise ValueError("All audio elements were skipped — nothing to mix")

    placed = _apply_ducking(placed)
    final = _mixdown(placed)

    ensure_dirs()
    out_dir = UPLOADS_DIR / "mix"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{scene_id}.wav"
    final.export(str(out_path), format="wav")

    duration_s = round(len(final) / 1000, 3)
    return out_path, duration_s, timeline, warnings


# ---------------------------------------------------------------------------
# Public async entry point
# ---------------------------------------------------------------------------

async def mix_scene(
    scene_id: str,
    elements: List[SceneElementIn],
    db: object,
) -> Tuple[Path, float, List[TimelineEntry], List[str]]:
    """Mix a scene's elements into a single WAV file.

    Returns (out_path, duration_seconds, timeline, warnings).
    Raises ValueError if no clips could be loaded.
    """
    resolved_paths = await _resolve_all_paths(elements, db)

    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        None,
        partial(_sync_work, elements, resolved_paths, scene_id),
    )
    return result


# ---------------------------------------------------------------------------
# Chapter-level mix (concatenate all scenes)
# ---------------------------------------------------------------------------

def _mix_scene_to_segment(
    elements: List[SceneElementIn],
    resolved_paths: Dict[str, Optional[Path]],
) -> Tuple[AudioSegment, List[str]]:
    """Same pipeline as _sync_work but returns AudioSegment instead of exporting."""
    placed, _timeline, warnings = _build_timeline_sync(elements, resolved_paths)

    if not placed:
        return AudioSegment.empty(), warnings + ["Scene skipped: no audio clips"]

    placed = _apply_ducking(placed)
    segment = _mixdown(placed)
    return segment, warnings


def _sync_chapter_work(
    chapter_id: str,
    scenes_data: List[Tuple[List[SceneElementIn], Dict[str, Optional[Path]]]],
) -> Tuple[Path, float, List[str]]:
    """Concatenate all scene segments with 1s silence between them."""
    all_warnings: List[str] = []
    segments: List[AudioSegment] = []

    for idx, (elements, resolved_paths) in enumerate(scenes_data):
        seg, warnings = _mix_scene_to_segment(elements, resolved_paths)
        all_warnings.extend(warnings)
        if len(seg) > 0:
            segments.append(seg)

    if not segments:
        raise ValueError("No scenes produced audio — nothing to concatenate")

    silence = AudioSegment.silent(duration=1000, frame_rate=SAMPLE_RATE)
    silence = _normalize_format(silence)

    combined = segments[0]
    for seg in segments[1:]:
        combined = combined + silence + seg

    ensure_dirs()
    out_dir = UPLOADS_DIR / "mix"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"chapter_{chapter_id}.wav"
    combined.export(str(out_path), format="wav")

    duration_s = round(len(combined) / 1000, 3)
    return out_path, duration_s, all_warnings


async def mix_chapter(
    chapter_id: str,
    scenes: List[Tuple[str, List[SceneElementIn]]],
    db: object,
) -> Tuple[Path, float, List[str]]:
    """Mix all scenes into a single chapter WAV.

    *scenes* is a list of (scene_id, elements) tuples.
    Returns (out_path, duration_seconds, warnings).
    """
    # Resolve paths for every scene (async)
    scenes_data: List[Tuple[List[SceneElementIn], Dict[str, Optional[Path]]]] = []
    for _scene_id, elements in scenes:
        resolved = await _resolve_all_paths(elements, db)
        scenes_data.append((elements, resolved))

    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        None,
        partial(_sync_chapter_work, chapter_id, scenes_data),
    )
    return result
