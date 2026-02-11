import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Chapter, Character, SceneElement, ProcessingStatus, DialogueElement } from '../types/script';
import { ElementType } from '../types/script';

export type AppStep = 0 | 1 | 2;

interface StoryState {
  rawScript: string;
  chapter: Chapter | null;
  currentStep: AppStep;
  parseError: string | null;
  activeSceneId: string | null;

  // Actions
  setRawScript: (text: string) => void;
  setChapter: (chapter: Chapter) => void;
  setParseError: (error: string | null) => void;
  setCurrentStep: (step: AppStep) => void;
  setActiveSceneId: (id: string | null) => void;

  updateChapterTitle: (title: string) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  updateElement: (sceneId: string, elementId: string, updates: Partial<SceneElement>) => void;
  reorderElements: (sceneId: string, elements: SceneElement[]) => void;
  addElement: (sceneId: string, element: SceneElement, atIndex?: number) => void;
  removeElement: (sceneId: string, elementId: string) => void;

  updateDialogueStatus: (sceneId: string, elementId: string, status: ProcessingStatus, audioUrl?: string) => void;
  addDialogueVariation: (sceneId: string, elementId: string, ttsId: string) => void;
  selectDialogueVariation: (sceneId: string, elementId: string, ttsId: string) => void;
  removeDialogueVariation: (sceneId: string, elementId: string, ttsId: string) => void;

  resetStore: () => void;
}

const initialState = {
  rawScript: '',
  chapter: null as Chapter | null,
  currentStep: 0 as AppStep,
  parseError: null as string | null,
  activeSceneId: null as string | null,
};

export const useStore = create<StoryState>()(
  persist(
    immer((set) => ({
      ...initialState,

      setRawScript: (text) =>
        set((state) => {
          state.rawScript = text;
        }),

      setChapter: (chapter) =>
        set((state) => {
          state.chapter = chapter;
          state.parseError = null;
          state.activeSceneId = chapter.scenes[0]?.id ?? null;
        }),

      setParseError: (error) =>
        set((state) => {
          state.parseError = error;
        }),

      setCurrentStep: (step) =>
        set((state) => {
          state.currentStep = step;
        }),

      setActiveSceneId: (id) =>
        set((state) => {
          state.activeSceneId = id;
        }),

      updateChapterTitle: (title) =>
        set((state) => {
          if (state.chapter) state.chapter.title = title;
        }),

      updateCharacter: (characterId, updates) =>
        set((state) => {
          if (!state.chapter) return;
          const char = state.chapter.characters.find((c) => c.id === characterId);
          if (char) Object.assign(char, updates);
        }),

      updateElement: (sceneId, elementId, updates) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (!scene) return;
          const element = scene.elements.find((e) => e.id === elementId);
          if (element) Object.assign(element, updates);
        }),

      reorderElements: (sceneId, elements) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (scene) {
            scene.elements = elements.map((el, idx) => ({ ...el, order: idx }));
          }
        }),

      addElement: (sceneId, element, atIndex) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (!scene) return;
          const idx = atIndex ?? scene.elements.length;
          scene.elements.splice(idx, 0, element);
          scene.elements.forEach((el, i) => {
            el.order = i;
          });
        }),

      removeElement: (sceneId, elementId) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (!scene) return;
          scene.elements = scene.elements.filter((e) => e.id !== elementId);
          scene.elements.forEach((el, i) => {
            el.order = i;
          });
        }),

      updateDialogueStatus: (sceneId, elementId, status, audioUrl) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (!scene) return;
          const el = scene.elements.find((e) => e.id === elementId);
          if (el && 'processingStatus' in el) {
            el.processingStatus = status;
            if (audioUrl) el.audioUrl = audioUrl;
          }
        }),

      addDialogueVariation: (sceneId, elementId, ttsId) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (!scene) return;
          const el = scene.elements.find((e) => e.id === elementId);
          if (!el || el.type !== ElementType.DIALOGUE) return;
          const dlg = el as DialogueElement;
          if (!dlg.audioVariations) dlg.audioVariations = [];
          dlg.audioVariations.push({ ttsId, createdAt: Date.now() });
          dlg.audioUrl = ttsId;
          dlg.processingStatus = 'completed';
        }),

      selectDialogueVariation: (sceneId, elementId, ttsId) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (!scene) return;
          const el = scene.elements.find((e) => e.id === elementId);
          if (!el || el.type !== ElementType.DIALOGUE) return;
          (el as DialogueElement).audioUrl = ttsId;
        }),

      removeDialogueVariation: (sceneId, elementId, ttsId) =>
        set((state) => {
          if (!state.chapter) return;
          const scene = state.chapter.scenes.find((s) => s.id === sceneId);
          if (!scene) return;
          const el = scene.elements.find((e) => e.id === elementId);
          if (!el || el.type !== ElementType.DIALOGUE) return;
          const dlg = el as DialogueElement;
          if (!dlg.audioVariations) return;
          dlg.audioVariations = dlg.audioVariations.filter((v) => v.ttsId !== ttsId);
          // If removed the selected one, auto-select latest
          if (dlg.audioUrl === ttsId) {
            const latest = dlg.audioVariations.length > 0
              ? dlg.audioVariations[dlg.audioVariations.length - 1].ttsId
              : undefined;
            dlg.audioUrl = latest;
            if (!latest) dlg.processingStatus = 'pending';
          }
        }),

      resetStore: () => set(() => ({ ...initialState })),
    })),
    {
      name: 'story-narration-store',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0) {
          // Migrate old audioUrl (full URL path) → ttsId based on element.id
          const chapter = state.chapter as Chapter | null;
          if (chapter) {
            for (const scene of chapter.scenes) {
              for (const el of scene.elements) {
                if (el.type === ElementType.DIALOGUE) {
                  const dlg = el as DialogueElement;
                  if (dlg.audioUrl && !dlg.audioVariations) {
                    dlg.audioVariations = [{ ttsId: dlg.id, createdAt: Date.now() }];
                    dlg.audioUrl = dlg.id;
                  }
                }
              }
            }
          }
        }
        if (version < 2) {
          // Add default prosody fields to existing characters
          const chapter = state.chapter as Chapter | null;
          if (chapter) {
            for (const char of chapter.characters) {
              if (!char.pitch) char.pitch = '0st';
              if (!char.rate) char.rate = '1.0';
              if (!char.volume) char.volume = 'medium';
            }
          }
        }
        return state as unknown as StoryState;
      },
      partialize: (state) => ({
        rawScript: state.rawScript,
        chapter: state.chapter,
        currentStep: state.currentStep,
        activeSceneId: state.activeSceneId,
      }),
    },
  ),
);
