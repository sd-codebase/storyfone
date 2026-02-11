from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


# --- Audio Library ---

class AudioFileOut(BaseModel):
    id: str
    filename: str
    stored_path: str
    category: str
    description: str
    tags: str
    duration_seconds: Optional[float]
    file_size: int
    mime_type: str
    created_at: str


class AudioSearchResult(BaseModel):
    results: list[AudioFileOut]
    total: int


# --- Dialogue TTS ---

class SpeakerConfig(BaseModel):
    name: str
    voiceName: str
    pitch: str = "0st"
    rate: str = "1.0"
    volume: str = "medium"


class ProcessDialogueRequest(BaseModel):
    dialogueId: str
    characterName: str
    voiceStyle: str
    dialogueText: str
    stageDirection: str
    language: str
    speakers: List[SpeakerConfig]


class ProcessDialogueResponse(BaseModel):
    dialogueId: str
    status: str  # 'completed' | 'error'
    audioUrl: Optional[str] = None
    error: Optional[str] = None


class BatchProcessRequest(BaseModel):
    dialogues: list[ProcessDialogueRequest]


class BatchProcessResponse(BaseModel):
    results: list[ProcessDialogueResponse]


# --- Projects ---

class ProjectCreate(BaseModel):
    name: str
    chapter_json: str  # JSON string of the full Chapter object


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    chapter_json: Optional[str] = None


class ProjectOut(BaseModel):
    id: str
    name: str
    chapter_json: str
    created_at: str
    updated_at: str


class ProjectListItem(BaseModel):
    id: str
    name: str
    created_at: str
    updated_at: str


# --- Scene Mix ---

class AudioTimingIn(BaseModel):
    duration: Optional[float] = None
    fade_in: Optional[float] = None
    fade_out: Optional[float] = None
    trim_start: Optional[float] = None


class SceneElementIn(BaseModel):
    id: str
    type: str  # "SFX" | "BGM" | "DIALOGUE" | "PAUSE"
    order: float
    description: Optional[str] = None
    timing: Optional[AudioTimingIn] = None
    audioFileId: Optional[str] = None  # SFX/BGM → MongoDB _id
    characterName: Optional[str] = None
    dialogueText: Optional[str] = None
    audioUrl: Optional[str] = None  # DIALOGUE → ttsId
    duration: Optional[float] = None  # PAUSE duration in seconds


class MixSceneRequest(BaseModel):
    sceneId: str
    elements: List[SceneElementIn]


class TimelineEntry(BaseModel):
    id: str
    type: str
    label: str
    start_s: float
    end_s: float


class MixSceneResponse(BaseModel):
    sceneId: str
    status: str  # "completed" | "error"
    audioUrl: Optional[str] = None
    duration_seconds: Optional[float] = None
    timeline: Optional[List[TimelineEntry]] = None
    warnings: Optional[List[str]] = None
    error: Optional[str] = None


# --- Chapter Mix ---

class MixChapterRequest(BaseModel):
    chapterId: str
    scenes: List[MixSceneRequest]


class MixChapterResponse(BaseModel):
    chapterId: str
    status: str  # "completed" | "error"
    audioUrl: Optional[str] = None
    duration_seconds: Optional[float] = None
    warnings: Optional[List[str]] = None
    error: Optional[str] = None


# --- Auth ---

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


# --- Admin: Languages ---

class LanguageCreate(BaseModel):
    name: str


class LanguageUpdate(BaseModel):
    name: Optional[str] = None


class LanguageOut(BaseModel):
    id: str
    name: str
    created_at: str
    updated_at: str


# --- Admin: Genres ---

class GenreCreate(BaseModel):
    name: str
    icon: str = ""
    is_adult: bool = False


class GenreUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    is_adult: Optional[bool] = None


class GenreOut(BaseModel):
    id: str
    name: str
    icon: str
    is_adult: bool
    created_at: str
    updated_at: str


# --- Admin: Authors ---

class AuthorCreate(BaseModel):
    name: str
    bio: Optional[str] = None


class AuthorUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None


class AuthorOut(BaseModel):
    id: str
    name: str
    bio: Optional[str]
    created_at: str
    updated_at: str


# --- Admin: Narrators ---

class NarratorCreate(BaseModel):
    name: str
    bio: Optional[str] = None


class NarratorUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None


class NarratorOut(BaseModel):
    id: str
    name: str
    bio: Optional[str]
    created_at: str
    updated_at: str


# --- Admin: Users ---

class UserCreate(BaseModel):
    name: str
    whatsapp_number: str
    is_verified: bool = False
    birthdate: Optional[str] = None
    plan: str = "Max"
    whatsapp_otp: Optional[str] = None
    pin: Optional[str] = None
    status: str = "active"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    whatsapp_number: Optional[str] = None
    is_verified: Optional[bool] = None
    birthdate: Optional[str] = None
    plan: Optional[str] = None
    whatsapp_otp: Optional[str] = None
    pin: Optional[str] = None
    status: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    whatsapp_number: str
    is_verified: bool
    birthdate: Optional[str]
    plan: str
    status: str
    created_at: str
    updated_at: str


class GenerateOtpResponse(BaseModel):
    otp: str
    whatsapp_number: str
    whatsapp_url: str


# --- Admin: Books ---

class BookOut(BaseModel):
    id: str
    title: str
    authors: List[str]
    narrators: List[str]
    language: Optional[str]
    genres: List[str]
    description: str
    is_published: bool
    is_adult: bool
    thumbnail_url: Optional[str]
    preview_audio_raw: Optional[str]
    preview_audio_hls: Optional[str]
    audio_status: str
    created_at: str
    updated_at: str


# --- Admin: Chapters ---

class ChapterOut(BaseModel):
    id: str
    name: str
    book_id: str
    status: str
    is_published: bool
    thumbnail_url: Optional[str]
    audio_raw: Optional[str]
    audio_hls: Optional[str]
    created_at: str
    updated_at: str
