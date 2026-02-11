import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { useStore } from '../../store';
import { processDialogue } from '../../api/client';
import type { DialogueElement } from '../../types/script';

export function useDialogueGenerate(sceneId: string) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const characters = useStore((s) => s.chapter?.characters ?? []);
  const addDialogueVariation = useStore((s) => s.addDialogueVariation);
  const updateDialogueStatus = useStore((s) => s.updateDialogueStatus);
  const charMapRef = useRef(characters);
  charMapRef.current = characters;

  const generate = useCallback(async (element: DialogueElement) => {
    const ttsId = `${element.id}_${Date.now()}`;
    const char = charMapRef.current.find((c) => c.name === element.characterName);

    setLoadingIds((prev) => new Set(prev).add(element.id));
    updateDialogueStatus(sceneId, element.id, 'processing');

    try {
      const result = await processDialogue({
        dialogueId: ttsId,
        characterName: element.characterName,
        voiceStyle: char?.defaultVoiceStyle ?? '',
        dialogueText: element.dialogueText,
        stageDirection: element.stageDirection,
        language: element.language,
        speakers: charMapRef.current.map((c) => ({
          name: c.name,
          voiceName: c.voiceName,
          pitch: c.pitch ?? '0st',
          rate: c.rate ?? '1.0',
          volume: c.volume ?? 'medium',
        })),
      });

      if (result.status === 'completed') {
        addDialogueVariation(sceneId, element.id, ttsId);
      } else {
        updateDialogueStatus(sceneId, element.id, 'error');
        message.error(`TTS failed for ${element.characterName}: ${result.error ?? 'Unknown error'}`);
      }
    } catch {
      updateDialogueStatus(sceneId, element.id, 'error');
      message.error(`TTS failed for ${element.characterName}`);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(element.id);
        return next;
      });
    }
  }, [sceneId, addDialogueVariation, updateDialogueStatus]);

  const isLoading = useCallback(
    (elementId: string) => loadingIds.has(elementId),
    [loadingIds],
  );

  return { generate, isLoading, loadingIds };
}
