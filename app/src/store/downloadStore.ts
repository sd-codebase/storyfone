import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  deleteAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { API_BASE } from '../constants/api';
import { useAuthStore } from './authStore';
import { createUserScopedStorage } from '../utils/userStorage';
import type { ApiChapterOut } from '../api/books';
import type { Book } from '../types/book';

const DOWNLOAD_DIR = `${documentDirectory}downloads/`;

interface ChapterDownload {
  chapterId: string;
  localUri: string;
}

interface BookDownload {
  bookId: string;
  bookData: Book;
  chaptersData: ApiChapterOut[];
  chapters: ChapterDownload[];
  totalChapters: number;
  progress: number;
  status: 'downloading' | 'done' | 'error';
}

interface DownloadStore {
  downloads: Record<string, BookDownload>;
  downloadBook: (book: Book, chapters: ApiChapterOut[]) => Promise<void>;
  removeDownload: (bookId: string) => Promise<void>;
  getLocalUri: (chapterId: string, bookId: string) => string | null;
  getBookData: (bookId: string) => Book | null;
  getChaptersData: (bookId: string) => ApiChapterOut[] | null;
  isDownloaded: (bookId: string) => boolean;
  isDownloading: (bookId: string) => boolean;
  getProgress: (bookId: string) => number;
}

async function ensureDir(path: string) {
  const info = await getInfoAsync(path);
  if (!info.exists) await makeDirectoryAsync(path, { intermediates: true });
}

async function downloadHlsChapter(
  hlsPath: string,
  localDir: string,
): Promise<string> {
  await ensureDir(localDir);

  // Build full URL for the HLS playlist
  const baseUrl = hlsPath.startsWith('http')
    ? hlsPath.substring(0, hlsPath.lastIndexOf('/') + 1)
    : API_BASE + hlsPath.substring(0, hlsPath.lastIndexOf('/') + 1);
  const playlistUrl = hlsPath.startsWith('http') ? hlsPath : API_BASE + hlsPath;

  // Download the m3u8 playlist
  const localPlaylist = localDir + 'playlist.m3u8';
  await downloadAsync(playlistUrl, localPlaylist);

  // Read the playlist and find .ts segment filenames
  const playlistContent = await readAsStringAsync(localPlaylist);
  const lines = playlistContent.split('\n');
  const segmentFiles: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      segmentFiles.push(trimmed);
    }
  }

  // Download each segment
  for (const segFile of segmentFiles) {
    await downloadAsync(baseUrl + segFile, localDir + segFile);
  }

  // Rewrite playlist to use local file:// URIs
  const rewrittenLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return localDir + trimmed;
    }
    return line;
  });
  await writeAsStringAsync(localPlaylist, rewrittenLines.join('\n'));

  return localPlaylist;
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      downloads: {},

      downloadBook: async (book, chapters) => {
        const bookId = book.id;
        const existing = get().downloads[bookId];
        if (existing?.status === 'downloading' || existing?.status === 'done') return;

        const userId = useAuthStore.getState().user?.id ?? '';
        const bookDir = `${DOWNLOAD_DIR}${userId}/${bookId}/`;
        await ensureDir(bookDir);

        const streamable = chapters.filter((ch) => ch.audio_hls);
        set((state) => ({
          downloads: {
            ...state.downloads,
            [bookId]: {
              bookId,
              bookData: book,
              chaptersData: chapters,
              chapters: [],
              totalChapters: streamable.length,
              progress: 0,
              status: 'downloading',
            },
          },
        }));

        const downloaded: ChapterDownload[] = [];
        try {
          for (let i = 0; i < streamable.length; i++) {
            const ch = streamable[i];
            const chapterDir = `${bookDir}${ch.id}/`;
            const localUri = await downloadHlsChapter(ch.audio_hls!, chapterDir);
            downloaded.push({ chapterId: ch.id, localUri });

            set((state) => ({
              downloads: {
                ...state.downloads,
                [bookId]: {
                  ...(state.downloads[bookId] ?? {
                    bookId,
                    bookData: book,
                    chaptersData: chapters,
                    totalChapters: streamable.length,
                    status: 'downloading',
                  }),
                  chapters: [...downloaded],
                  progress: (i + 1) / streamable.length,
                },
              },
            }));
          }

          set((state) => ({
            downloads: {
              ...state.downloads,
              [bookId]: { ...(state.downloads[bookId] as BookDownload), status: 'done', progress: 1 },
            },
          }));
        } catch {
          set((state) => ({
            downloads: {
              ...state.downloads,
              [bookId]: { ...(state.downloads[bookId] as BookDownload), status: 'error' },
            },
          }));
        }
      },

      removeDownload: async (bookId) => {
        const userId = useAuthStore.getState().user?.id ?? '';
        const bookDir = `${DOWNLOAD_DIR}${userId}/${bookId}/`;
        try {
          await deleteAsync(bookDir, { idempotent: true });
        } catch {}
        set((state) => {
          const next = { ...state.downloads };
          delete next[bookId];
          return { downloads: next };
        });
      },

      getLocalUri: (chapterId, bookId) => {
        const dl = get().downloads[bookId];
        if (!dl || dl.status !== 'done') return null;
        return dl.chapters.find((c) => c.chapterId === chapterId)?.localUri ?? null;
      },

      getBookData: (bookId) => {
        return get().downloads[bookId]?.bookData ?? null;
      },

      getChaptersData: (bookId) => {
        return get().downloads[bookId]?.chaptersData ?? null;
      },

      isDownloaded: (bookId) => get().downloads[bookId]?.status === 'done',
      isDownloading: (bookId) => get().downloads[bookId]?.status === 'downloading',
      getProgress: (bookId) => get().downloads[bookId]?.progress ?? 0,
    }),
    {
      name: 'download-store',
      storage: createJSONStorage(() => createUserScopedStorage()),
    },
  ),
);
