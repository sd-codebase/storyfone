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
    birth_year: Optional[int] = None
    plan: str = "Max"
    whatsapp_otp: Optional[str] = None
    pin: Optional[str] = None
    status: str = "active"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    whatsapp_number: Optional[str] = None
    is_verified: Optional[bool] = None
    birth_year: Optional[int] = None
    plan: Optional[str] = None
    whatsapp_otp: Optional[str] = None
    pin: Optional[str] = None
    status: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    whatsapp_number: str
    country_code: str
    is_verified: bool
    birth_year: Optional[int]
    plan: str
    status: str
    created_at: str
    updated_at: str


class GenerateOtpResponse(BaseModel):
    otp: str
    whatsapp_number: str
    whatsapp_url: str


# --- Mobile App: Auth ---

class AppRegisterRequest(BaseModel):
    whatsapp_number: str
    country_code: str
    birth_year: int
    pin: str
    name: str = ""
    preferred_languages: Optional[List[str]] = None


class AppLoginRequest(BaseModel):
    whatsapp_number: str
    country_code: str
    pin: str


class AppUserOut(BaseModel):
    id: str
    name: str
    whatsapp_number: str
    country_code: str
    birth_year: int
    is_adult: bool
    is_verified: bool
    plan: str
    status: str
    preferred_languages: List[str] = []
    created_at: str
    pending_whatsapp_number: Optional[str] = None
    pending_country_code: Optional[str] = None
    has_pending_whatsapp: bool = False


class AppAuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: AppUserOut


class AppUserUpdateRequest(BaseModel):
    name: Optional[str] = None
    preferred_languages: Optional[List[str]] = None


# --- Mobile App: PIN ---

class PinCreateRequest(BaseModel):
    pin: str


class PinVerifyRequest(BaseModel):
    pin: str


class PinVerifyResponse(BaseModel):
    valid: bool


class PinExistsResponse(BaseModel):
    has_pin: bool


# --- Mobile App: Books ---

class AppBookOut(BaseModel):
    id: str
    title: str
    authors: List[str]
    genres: List[str]
    description: str
    is_adult: bool
    language: Optional[str] = None
    tags: List[str] = []
    thumbnail_url: Optional[str] = None
    chapter_count: int = 0
    listen_count: int = 0
    likes_count: int = 0
    average_rating: float = 0
    rating_count: int = 0
    created_at: str


class AppBookListResponse(BaseModel):
    books: List[AppBookOut]
    total: int


class AppChapterOut(BaseModel):
    id: str
    name: str
    book_id: str
    audio_hls: Optional[str] = None
    order: int = 0
    created_at: str


class AppGenreOut(BaseModel):
    id: str
    name: str
    icon: str
    is_adult: bool


# --- Mobile App: Library ---

class ToggleLikeResponse(BaseModel):
    liked: bool
    likes_count: int = 0


class LikedBooksResponse(BaseModel):
    book_ids: List[str]


class ProgressSaveRequest(BaseModel):
    chapter_index: int
    position: float
    percent: float


class ProgressEntry(BaseModel):
    book_id: str
    chapter_index: int
    position: float
    percent: float
    last_played: str


class ProgressListResponse(BaseModel):
    progress: List[ProgressEntry]


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


# --- Admin: Trending ---

class TrendingSetRequest(BaseModel):
    book_ids_sfw: List[str]
    book_ids_adult: List[str]


class TrendingOut(BaseModel):
    language: str
    language_name: str
    book_ids_sfw: List[str]
    book_ids_adult: List[str]
    updated_at: str


# --- Admin: Editor Picks ---

class EditorPickSetRequest(BaseModel):
    book_id_sfw: str
    book_id_adult: Optional[str] = None


class EditorPickOut(BaseModel):
    language: str
    language_name: str
    book_id_sfw: str
    book_id_adult: Optional[str] = None
    updated_at: str


# --- Mobile App: Rating ---

class RateBookRequest(BaseModel):
    rating: int  # 1-5


class BookRatingOut(BaseModel):
    user_rating: Optional[int] = None
    average: float = 0
    count: int = 0


# --- Mobile App: Report ---

class ReportBookRequest(BaseModel):
    reason: str


class ReportOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    book_id: str
    book_title: str
    reason: str
    created_at: str


# --- Mobile App: User Stats ---

class UserStatsOut(BaseModel):
    total_hours: float = 0
    unique_books: int = 0
    streak_days: int = 0


# --- Mobile App: WhatsApp Change ---

class ChangeWhatsappRequest(BaseModel):
    new_whatsapp_number: str
    new_country_code: str


class VerifyWhatsappRequest(BaseModel):
    otp: str
