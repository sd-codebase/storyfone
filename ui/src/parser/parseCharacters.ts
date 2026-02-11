import { nanoid } from 'nanoid';
import type { Character } from '../types/script';
import { CHARACTER_PALETTE } from '../types/script';
import { GEMINI_VOICES } from '../types/voices';
import { CHARACTERS_HEADER, SCENE_HEADER } from './patterns';

export function parseCharacters(lines: string[]): Character[] {
  const characters: Character[] = [];
  let inCharSection = false;
  let colorIdx = 0;

  for (const line of lines) {
    if (CHARACTERS_HEADER.test(line)) {
      inCharSection = true;
      continue;
    }
    if (inCharSection && SCENE_HEADER.test(line)) {
      break;
    }
    if (inCharSection && line.trim()) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const name = line.slice(0, colonIdx).trim();
        const voiceStyle = line.slice(colonIdx + 1).trim();
        characters.push({
          id: nanoid(),
          name,
          defaultVoiceStyle: voiceStyle,
          voiceName: GEMINI_VOICES[colorIdx % GEMINI_VOICES.length].name,
          color: CHARACTER_PALETTE[colorIdx % CHARACTER_PALETTE.length],
          pitch: '0st',
          rate: '1.0',
          volume: 'medium',
        });
        colorIdx++;
      }
    }
  }

  return characters;
}
