import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import TrackPlayer, { TrackType } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Book } from '../types/book';
import type { ApiChapterOut } from '../api/books';
import { API_BASE } from '../constants/api';
import { useDownloadStore } from './downloadStore';

type SleepTimerValue = null | 1 | 5 | 15 | 30 | 45 | 60 | 'chapter';

const SESSION_KEY = 'player-session';

interface PlayerSession {
  currentBook: Book;
  chapters: ApiChapterOut[];
  currentChapterIndex: number;
  playbackSpeed: number;
  currentTime: number;
}

function saveSession(state: PlayerSession) {
  AsyncStorage.setItem(SESSION_KEY, JSON.stringify(state)).catch(() => {});
}

function clearSession() {
  AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
}

export async function loadSession(): Promise<PlayerSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerSession;
  } catch {
    return null;
  }
}

interface PlayerStore {
  currentBook: Book | null;
  chapters: ApiChapterOut[];
  currentChapterIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  sleepTimer: SleepTimerValue;
  showMiniPlayer: boolean;
  canRate: boolean;
  bookmarks: number[];

  loadBook: (book: Book, chapters: ApiChapterOut[], chapterIndex?: number) => void;
  restoreSession: (session: PlayerSession) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  seekBy: (seconds: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  setSpeed: (speed: number) => void;
  setSleepTimer: (value: SleepTimerValue) => void;
  toggleBookmark: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentChapterIndex: (index: number) => void;
  setCanRate: (value: boolean) => void;
  dismiss: () => void;
}

export function buildTracks(book: Book, chapters: ApiChapterOut[]) {
  const dlStore = useDownloadStore.getState();
  return chapters
    .filter((ch) => ch.audio_hls)
    .map((ch) => {
      const localUri = dlStore.getLocalUri(ch.id, book.id);
      return {
        id: ch.id,
        url: localUri ?? (ch.audio_hls!.startsWith('http') ? ch.audio_hls! : API_BASE + ch.audio_hls!),
        title: ch.name,
        artist: book.author,
        artwork: book.thumbnailUrl
          ? book.thumbnailUrl.startsWith('http')
            ? book.thumbnailUrl
            : API_BASE + book.thumbnailUrl
          : undefined,
        type: TrackType.HLS,
      };
    });
}

export const usePlayerStore = create<PlayerStore>()(
  immer((set, get) => ({
    currentBook: null,
    chapters: [],
    currentChapterIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    sleepTimer: null,
    showMiniPlayer: false,
    canRate: false,
    bookmarks: [],

    loadBook: (book, chapters, chapterIndex = 0) => {
      set((state) => {
        state.currentBook = book;
        state.chapters = chapters;
        state.currentChapterIndex = chapterIndex;
        state.isPlaying = true;
        state.currentTime = 0;
        state.duration = 0;
        state.showMiniPlayer = true;
        state.canRate = false;
        state.bookmarks = [];
      });

      saveSession({ currentBook: book, chapters, currentChapterIndex: chapterIndex, playbackSpeed: get().playbackSpeed, currentTime: 0 });

      const tracks = buildTracks(book, chapters);
      if (tracks.length === 0) return;

      (async () => {
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        if (chapterIndex > 0 && chapterIndex < tracks.length) {
          await TrackPlayer.skip(chapterIndex);
        }
        await TrackPlayer.play();
      })();
    },

    restoreSession: (session) => {
      set((state) => {
        state.currentBook = session.currentBook;
        state.chapters = session.chapters;
        state.currentChapterIndex = session.currentChapterIndex;
        state.playbackSpeed = session.playbackSpeed;
        state.currentTime = session.currentTime;
        state.showMiniPlayer = true;
        state.isPlaying = false;
      });
    },

    play: () => {
      set((state) => { state.isPlaying = true; });
      TrackPlayer.play();
    },

    pause: () => {
      set((state) => { state.isPlaying = false; });
      TrackPlayer.pause();
    },

    togglePlayPause: () => {
      const playing = get().isPlaying;
      set((state) => { state.isPlaying = !playing; });
      if (playing) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
    },

    seekTo: (time) => {
      const d = get().duration;
      const clamped = Math.max(0, Math.min(d || Infinity, time));
      set((state) => { state.currentTime = clamped; });
      TrackPlayer.seekTo(clamped);
    },

    seekBy: (seconds) => {
      (async () => {
        const { position } = await TrackPlayer.getProgress();
        const target = Math.max(0, position + seconds);
        set((state) => { state.currentTime = target; });
        await TrackPlayer.seekTo(target);
      })();
    },

    nextChapter: () => {
      const { currentBook, currentChapterIndex, chapters, playbackSpeed } = get();
      if (currentBook && currentChapterIndex < currentBook.chapters - 1) {
        const newIndex = currentChapterIndex + 1;
        set((state) => {
          state.currentChapterIndex = newIndex;
          state.currentTime = 0;
          state.duration = 0;
          state.bookmarks = [];
        });
        saveSession({ currentBook, chapters, currentChapterIndex: newIndex, playbackSpeed, currentTime: 0 });
        TrackPlayer.skipToNext();
      }
    },

    prevChapter: () => {
      const { currentBook, currentChapterIndex, chapters, playbackSpeed } = get();
      if (currentChapterIndex > 0) {
        const newIndex = currentChapterIndex - 1;
        set((state) => {
          state.currentChapterIndex = newIndex;
          state.currentTime = 0;
          state.duration = 0;
          state.bookmarks = [];
        });
        if (currentBook) {
          saveSession({ currentBook, chapters, currentChapterIndex: newIndex, playbackSpeed, currentTime: 0 });
        }
        TrackPlayer.skipToPrevious();
      }
    },

    setSpeed: (speed) => {
      set((state) => { state.playbackSpeed = speed; });
      TrackPlayer.setRate(speed);
    },

    setSleepTimer: (value) =>
      set((state) => { state.sleepTimer = value; }),

    toggleBookmark: () =>
      set((state) => {
        const time = Math.floor(state.currentTime);
        const idx = state.bookmarks.indexOf(time);
        if (idx >= 0) state.bookmarks.splice(idx, 1);
        else {
          state.bookmarks.push(time);
          state.bookmarks.sort((a, b) => a - b);
        }
      }),

    setCurrentTime: (time) =>
      set((state) => { state.currentTime = time; }),

    setDuration: (duration) =>
      set((state) => { state.duration = duration; }),

    setIsPlaying: (playing) =>
      set((state) => { state.isPlaying = playing; }),

    setCurrentChapterIndex: (index) =>
      set((state) => {
        state.currentChapterIndex = index;
        state.currentTime = 0;
        state.duration = 0;
        state.bookmarks = [];
      }),

    setCanRate: (value) =>
      set((state) => { state.canRate = value; }),

    dismiss: () => {
      set((state) => {
        state.showMiniPlayer = false;
        state.isPlaying = false;
        state.canRate = false;
        state.currentBook = null;
        state.chapters = [];
      });
      clearSession();
      TrackPlayer.reset();
    },
  }))
);
