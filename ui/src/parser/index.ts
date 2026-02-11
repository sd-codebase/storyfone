import { nanoid } from 'nanoid';
import type { Chapter } from '../types/script';
import { parseChapterHeader } from './parseChapter';
import { parseCharacters } from './parseCharacters';
import { parseScenes } from './parseScenes';

export function parseScript(rawText: string): Chapter {
  const lines = rawText.split('\n').map((l) => l.trimEnd());

  // Phase 1: Chapter header
  const header = parseChapterHeader(lines);
  if (!header) {
    throw new Error('Could not find chapter header (प्रकरण)');
  }

  // Phase 2: Characters
  const characters = parseCharacters(lines);
  if (characters.length === 0) {
    throw new Error('No characters found in पात्रे: section');
  }

  const characterNames = new Set(characters.map((c) => c.name));

  // Phase 3: Scenes
  const scenes = parseScenes(lines, characterNames);
  if (scenes.length === 0) {
    throw new Error('No scenes found (दृश्य)');
  }

  return {
    id: nanoid(),
    title: header.title,
    characters,
    scenes,
  };
}
