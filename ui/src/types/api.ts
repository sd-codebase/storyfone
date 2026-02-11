import type { ProcessingStatus } from './script';

export interface SpeakerConfig {
  name: string;
  voiceName: string;
  pitch: string;
  rate: string;
  volume: string;
}

export interface ProcessDialogueRequest {
  dialogueId: string;
  characterName: string;
  voiceStyle: string;
  dialogueText: string;
  stageDirection: string;
  language: string;
  speakers: SpeakerConfig[];
}

// --- Audio Library ---

export interface AudioFileInfo {
  id: string;
  filename: string;
  stored_path: string;
  category: 'sfx' | 'bgm';
  description: string;
  tags: string;
  duration_seconds: number | null;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface AudioSearchResult {
  results: AudioFileInfo[];
  total: number;
}

// --- Projects ---

export interface ProjectInfo {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFull extends ProjectInfo {
  chapter_json: string;
}

export interface ProcessDialogueResponse {
  dialogueId: string;
  status: ProcessingStatus;
  audioUrl?: string;
  error?: string;
}

export interface BatchProcessRequest {
  dialogues: ProcessDialogueRequest[];
}

export interface BatchProcessResponse {
  results: ProcessDialogueResponse[];
}

// --- Scene Mix ---

export interface TimelineEntry {
  id: string;
  type: string;
  label: string;
  start_s: number;
  end_s: number;
}

export interface MixSceneResponse {
  sceneId: string;
  status: 'completed' | 'error';
  audioUrl?: string;
  duration_seconds?: number;
  timeline?: TimelineEntry[];
  warnings?: string[];
  error?: string;
}

export interface MixChapterResponse {
  chapterId: string;
  status: 'completed' | 'error';
  audioUrl?: string;
  duration_seconds?: number;
  warnings?: string[];
  error?: string;
}
