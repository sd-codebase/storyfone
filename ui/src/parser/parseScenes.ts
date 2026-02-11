import { nanoid } from 'nanoid';
import type { Scene } from '../types/script';
import { SCENE_HEADER, devanagariToArabic } from './patterns';
import { parseElement } from './parseElements';

interface RawScene {
  number: number;
  title: string;
  lines: string[];
}

function splitIntoRawScenes(lines: string[]): RawScene[] {
  const scenes: RawScene[] = [];
  let current: RawScene | null = null;

  for (const line of lines) {
    const match = line.match(SCENE_HEADER);
    if (match) {
      if (current) scenes.push(current);
      current = {
        number: parseInt(devanagariToArabic(match[1]), 10),
        title: match[2].trim(),
        lines: [],
      };
      continue;
    }
    if (current && line.trim()) {
      current.lines.push(line.trim());
    }
  }

  if (current) scenes.push(current);
  return scenes;
}

export function parseScenes(
  lines: string[],
  characterNames: Set<string>,
): Scene[] {
  const rawScenes = splitIntoRawScenes(lines);

  return rawScenes.map((raw) => {
    let order = 0;
    const elements = raw.lines
      .map((line) => parseElement(line, characterNames, order++))
      .filter((el): el is NonNullable<typeof el> => el !== null);

    // Re-assign contiguous order values
    elements.forEach((el, idx) => {
      el.order = idx;
    });

    return {
      id: nanoid(),
      sceneNumber: raw.number,
      title: raw.title,
      elements,
    };
  });
}
