import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  deleteAsync,
} from 'expo-file-system/legacy';
import { API_BASE, ENDPOINTS } from '../constants/api';
import type { ApiChapterOut } from '../api/books';

const DOWNLOAD_DIR = `${documentDirectory}downloads/`;

interface ChapterDownload {
  chapterId: string;
  localUri: string;
}

interface BookDownload {
  bookId: string;
  chapters: ChapterDownload[];
  totalChapters: number;
  progress: number;
  status: 'downloading' | 'done' | 'error';
}

interface DownloadStore {
  downloads: Record<string, BookDownload>;
  downloadBook: (bookId: string, chapters: ApiChapterOut[]) => Promise<void>;
  removeDownload: (bookId: string) => Promise<void>;
  getLocalUri: (chapterId: string, bookId: string) => string | null;
  isDownloaded: (bookId: string) => boolean;
  isDownloading: (bookId: string) => boolean;
  getProgress: (bookId: string) => number;
}

async function ensureDir(path: string) {
  const info = await getInfoAsync(path);
  if (!info.exists) await makeDirectoryAsync(path, { intermediates: true });
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      downloads: {},

      downloadBook: async (bookId, chapters) => {
        const existing = get().downloads[bookId];
        if (existing?.status === 'downloading' || existing?.status === 'done') return;

        const bookDir = `${DOWNLOAD_DIR}${bookId}/`;
        await ensureDir(bookDir);

        const streamable = chapters.filter((ch) => ch.audio_hls);
        set((state) => ({
          downloads: {
            ...state.downloads,
            [bookId]: { bookId, chapters: [], totalChapters: streamable.length, progress: 0, status: 'downloading' },
          },
        }));

        const downloaded: ChapterDownload[] = [];
        try {
          for (let i = 0; i < streamable.length; i++) {
            const ch = streamable[i];
            const url = `${API_BASE}${ENDPOINTS.audio.stream(ch.id)}`;
            const localUri = `${bookDir}${ch.id}.audio`;
            await downloadAsync(url, localUri);
            downloaded.push({ chapterId: ch.id, localUri });

            set((state) => ({
              downloads: {
                ...state.downloads,
                [bookId]: {
                  ...state.downloads[bookId],
                  chapters: [...downloaded],
                  progress: (i + 1) / streamable.length,
                },
              },
            }));
          }

          set((state) => ({
            downloads: {
              ...state.downloads,
              [bookId]: { ...state.downloads[bookId], status: 'done', progress: 1 },
            },
          }));
        } catch {
          set((state) => ({
            downloads: {
              ...state.downloads,
              [bookId]: { ...state.downloads[bookId], status: 'error' },
            },
          }));
        }
      },

      removeDownload: async (bookId) => {
        const bookDir = `${DOWNLOAD_DIR}${bookId}/`;
        try {
          await deleteAsync(bookDir, { idempotent: true });
        } catch {}
        set((state) => {
          const { [bookId]: _, ...rest } = state.downloads;
          return { downloads: rest };
        });
      },

      getLocalUri: (chapterId, bookId) => {
        const dl = get().downloads[bookId];
        if (!dl || dl.status !== 'done') return null;
        return dl.chapters.find((c) => c.chapterId === chapterId)?.localUri ?? null;
      },

      isDownloaded: (bookId) => get().downloads[bookId]?.status === 'done',
      isDownloading: (bookId) => get().downloads[bookId]?.status === 'downloading',
      getProgress: (bookId) => get().downloads[bookId]?.progress ?? 0,
    }),
    {
      name: 'download-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
