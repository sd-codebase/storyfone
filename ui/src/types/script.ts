export const ElementType = {
  SFX: 'SFX',
  BGM: 'BGM',
  DIALOGUE: 'DIALOGUE',
  PAUSE: 'PAUSE',
} as const;

export type ElementType = (typeof ElementType)[keyof typeof ElementType];

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface AudioTiming {
  duration?: number;
  fade_in?: number;
  fade_out?: number;
  modifier?: string;
  trim_start?: number;
}

export interface SfxElement {
  id: string;
  type: typeof ElementType.SFX;
  description: string;
  timing: AudioTiming;
  order: number;
  audioFileId?: string;
  audioFileName?: string;
}

export interface BgmElement {
  id: string;
  type: typeof ElementType.BGM;
  description: string;
  timing: AudioTiming;
  order: number;
  audioFileId?: string;
  audioFileName?: string;
}

export interface AudioVariation {
  ttsId: string;       // unique ID = backend filename, e.g., "{elementId}_{timestamp}"
  createdAt: number;   // Date.now()
}

export interface DialogueElement {
  id: string;
  type: typeof ElementType.DIALOGUE;
  characterName: string;
  stageDirection: string;
  dialogueText: string;
  language: string;
  order: number;
  processingStatus?: ProcessingStatus;
  audioUrl?: string;
  audioVariations?: AudioVariation[];
}

export interface PauseElement {
  id: string;
  type: typeof ElementType.PAUSE;
  duration: number;
  order: number;
}

export type SceneElement = SfxElement | BgmElement | DialogueElement | PauseElement;

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  elements: SceneElement[];
}

export interface Character {
  id: string;
  name: string;
  defaultVoiceStyle: string;
  voiceName: string;
  color: string;
  pitch: string;
  rate: string;
  volume: string;
}

// Fixed colors for non-dialogue element types
export const ELEMENT_COLORS = {
  SFX: '#1890ff',
  BGM: '#52c41a',
  PAUSE: '#faad14',
} as const;

// Palette for auto-assigning character colors
export const CHARACTER_PALETTE = [
  '#b37feb', // purple — narrator
  '#fa8c16', // orange
  '#13c2c2', // cyan
  '#eb2f96', // magenta
  '#fadb14', // gold
  '#ff4d4f', // red
  '#2f54eb', // geek blue
  '#a0d911', // lime
  '#fa541c', // volcano
  '#597ef7', // light blue
] as const;

export interface Chapter {
  id: string;
  title: string;
  characters: Character[];
  scenes: Scene[];
}
