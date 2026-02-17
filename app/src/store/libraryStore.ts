import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import * as libraryApi from '../api/library';
import { createUserScopedStorage } from '../utils/userStorage';

interface ListeningProgress {
  chapterIndex: number;
  position: number;
  percent: number;
  lastPlayed: string; // ISO date
}

interface LibraryStore {
  likedBookIds: string[];
  listeningProgress: Record<string, ListeningProgress>;
  toggleLike: (bookId: string) => Promise<void>;
  isLiked: (bookId: string) => boolean;
  updateProgress: (bookId: string, progress: ListeningProgress) => void;
  syncFromServer: () => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    immer((set, get) => ({
      likedBookIds: [],
      listeningProgress: {},
      toggleLike: async (bookId) => {
        try {
          const { liked } = await libraryApi.toggleLike(bookId);
          set((state) => {
            const idx = state.likedBookIds.indexOf(bookId);
            if (liked && idx < 0) state.likedBookIds.push(bookId);
            if (!liked && idx >= 0) state.likedBookIds.splice(idx, 1);
          });
        } catch {
          // On failure, don't update — user sees no change
        }
      },
      isLiked: (bookId) => get().likedBookIds.includes(bookId),
      updateProgress: (bookId, progress) => {
        set((state) => {
          state.listeningProgress[bookId] = progress;
        });
        libraryApi.saveProgress(bookId, {
          chapter_index: progress.chapterIndex,
          position: progress.position,
          percent: progress.percent,
        }).catch(() => {});
      },
      syncFromServer: async () => {
        try {
          const [likedIds, progressList] = await Promise.all([
            libraryApi.getLikedBooks(),
            libraryApi.getAllProgress(),
          ]);
          set((state) => {
            state.likedBookIds = likedIds;
            for (const p of progressList) {
              state.listeningProgress[p.book_id] = {
                chapterIndex: p.chapter_index,
                position: p.position,
                percent: p.percent,
                lastPlayed: p.last_played,
              };
            }
          });
        } catch {
          // Keep local data on failure
        }
      },
    })),
    {
      name: 'shrota-library',
      storage: createJSONStorage(() => createUserScopedStorage()),
    }
  )
);
