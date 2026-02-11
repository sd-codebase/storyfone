import { nanoid } from 'nanoid';
import { ElementType } from '../types/script';
import type { SceneElement, AudioTiming } from '../types/script';
import {
  AUDIO_BLOCK,
  PAUSE_BLOCK,
  DURATION_PATTERN,
  FADE_IN_PATTERN,
  FADE_OUT_PATTERN,
  MODIFIER_PATTERN,
  STAGE_DIRECTION,
} from './patterns';

function parseAudioTiming(content: string): AudioTiming {
  const timing: AudioTiming = {};

  const dur = content.match(DURATION_PATTERN);
  if (dur) timing.duration = parseFloat(dur[1]);

  const fadeIn = content.match(FADE_IN_PATTERN);
  if (fadeIn) timing.fade_in = parseFloat(fadeIn[1]);

  const fadeOut = content.match(FADE_OUT_PATTERN);
  if (fadeOut) timing.fade_out = parseFloat(fadeOut[1]);

  const mod = content.match(MODIFIER_PATTERN);
  if (mod) timing.modifier = mod[1].trim();

  return timing;
}

export function parseElement(
  line: string,
  characterNames: Set<string>,
  order: number,
): SceneElement | null {
  // Check for SFX/BGM
  const audioMatch = line.match(AUDIO_BLOCK);
  if (audioMatch) {
    const blockType = audioMatch[1] as 'SFX' | 'BGM';
    const content = audioMatch[2];

    // Extract description: everything before the first field marker
    const descEnd = content.search(/\.\s*(Duration|Fade)/);
    const description = descEnd > 0
      ? content.slice(0, descEnd).trim()
      : content.replace(/Duration:.*|Fade-.*$/g, '').trim();

    return {
      id: nanoid(),
      type: blockType === 'SFX' ? ElementType.SFX : ElementType.BGM,
      description,
      timing: parseAudioTiming(content),
      order,
    };
  }

  // Check for PAUSE
  const pauseMatch = line.match(PAUSE_BLOCK);
  if (pauseMatch) {
    return {
      id: nanoid(),
      type: ElementType.PAUSE,
      duration: parseFloat(pauseMatch[1]),
      order,
    };
  }

  // Check for dialogue — line starts with a known character name followed by ':'
  for (const name of characterNames) {
    if (line.startsWith(name + ':')) {
      let rest = line.slice(name.length + 1).trim();
      let stageDirection = '';

      const sdMatch = rest.match(STAGE_DIRECTION);
      if (sdMatch) {
        stageDirection = sdMatch[1];
        rest = rest.slice(sdMatch[0].length);
      }

      return {
        id: nanoid(),
        type: ElementType.DIALOGUE,
        characterName: name,
        stageDirection,
        dialogueText: rest.trim(),
        language: 'mr',
        order,
        processingStatus: 'pending',
      };
    }
  }

  return null;
}
