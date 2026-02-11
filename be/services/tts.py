from __future__ import annotations

import base64
import struct
from pathlib import Path

import aiofiles
from google import genai
from google.genai import types

from config import GEMINI_API_KEY, UPLOADS_DIR

def _get_client() -> genai.Client:
    return genai.Client(api_key=GEMINI_API_KEY)


async def generate_speech(
    dialogue_text: str,
    speakers: list,
    dialogue_id: str,
    stage_direction: str = "",
    character_name: str = "",
    language: str = "mr",
) -> Path:
    """Call Gemini 2.5 Pro TTS and save the resulting audio to uploads/tts/{dialogue_id}.wav."""
    client = _get_client()

    # Look up current speaker's prosody from the speakers list
    current = next((s for s in speakers if s.name == character_name), None)
    pitch = current.pitch if current else "0st"
    rate = current.rate if current else "1.0"
    volume = current.volume if current else "medium"

    # Build SSML with prosody controls
    ssml_text = (
        f'<speak><prosody pitch="{pitch}" rate="{rate}" volume="{volume}">'
        f'{dialogue_text}</prosody></speak>'
    )

    # Stage direction as context, then "NAME: <ssml>"
    content_parts: list[str] = []
    if stage_direction:
        content_parts.append(f"({stage_direction})")
    content_parts.append(f"{character_name}: {ssml_text}")
    content = "\n".join(content_parts)

    # Build voice config: multi-speaker (first 2) or single-speaker fallback
    if len(speakers) >= 2:
        speech_config = types.SpeechConfig(
            multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
                speaker_voice_configs=[
                    types.SpeakerVoiceConfig(
                        speaker=s.name,
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=s.voiceName,
                            )
                        ),
                    )
                    for s in speakers[:2]
                ]
            )
        )
    else:
        voice_name = speakers[0].voiceName if speakers else "Kore"
        speech_config = types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name=voice_name,
                )
            )
        )

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=content,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=speech_config,
        ),
    )

    audio_data = response.candidates[0].content.parts[0].inline_data.data
    pcm_bytes = base64.b64decode(audio_data) if isinstance(audio_data, str) else audio_data

    # Wrap raw PCM (16-bit, 24kHz, mono) in a WAV header so browsers can play it
    audio_bytes = _wrap_wav(pcm_bytes) if not pcm_bytes[:4] == b"RIFF" else pcm_bytes

    out_dir = UPLOADS_DIR / "tts"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{dialogue_id}.wav"

    async with aiofiles.open(out_path, "wb") as f:
        await f.write(audio_bytes)

    return out_path


def _wrap_wav(pcm: bytes, sample_rate: int = 24000, channels: int = 1, bits: int = 16) -> bytes:
    """Wrap raw PCM bytes in a standard WAV (RIFF) header."""
    data_size = len(pcm)
    byte_rate = sample_rate * channels * (bits // 8)
    block_align = channels * (bits // 8)
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + data_size,     # file size - 8
        b"WAVE",
        b"fmt ",
        16,                 # fmt chunk size
        1,                  # PCM format
        channels,
        sample_rate,
        byte_rate,
        block_align,
        bits,
        b"data",
        data_size,
    )
    return header + pcm
