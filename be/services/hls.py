from __future__ import annotations

import asyncio
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


async def process_audio_to_hls(input_path: Path, output_dir: Path) -> bool:
    """Convert an audio file to HLS format using ffmpeg.

    Returns True on success, False on error.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    playlist = output_dir / "playlist.m3u8"
    segment_pattern = str(output_dir / "segment_%03d.ts")

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-codec:a", "aac",
        "-b:a", "128k",
        "-hls_time", "10",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", segment_pattern,
        str(playlist),
    ]

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()

    if proc.returncode != 0:
        logger.error("ffmpeg failed: %s", stderr.decode(errors="replace"))
        return False

    return True
