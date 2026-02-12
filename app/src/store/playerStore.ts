import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import TrackPlayer, { TrackType } from 'react-native-track-player';
import type { Book } from '../types/book';
import type { ApiChapterOut } from '../api/books';
import { API_BASE } from '../constants/api';

type SleepTimerValue = null | 15 | 30 | 45 | 60 | 'chapter';

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

function buildTracks(book: Book, chapters: ApiChapterOut[]) {
  return chapters
    .filter((ch) => ch.audio_hls)
    .map((ch) => ({
      id: ch.id,
      url: ch.audio_hls!.startsWith('http') ? ch.audio_hls! : API_BASE + ch.audio_hls!,
      title: ch.name,
      artist: book.author,
      artwork: book.thumbnailUrl
        ? book.thumbnailUrl.startsWith('http')
          ? book.thumbnailUrl
          : API_BASE + book.thumbnailUrl
        : undefined,
      type: TrackType.HLS,
    }));
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
      const { currentBook, currentChapterIndex } = get();
      if (currentBook && currentChapterIndex < currentBook.chapters - 1) {
        set((state) => {
          state.currentChapterIndex += 1;
          state.currentTime = 0;
          state.duration = 0;
          state.bookmarks = [];
        });
        TrackPlayer.skipToNext();
      }
    },

    prevChapter: () => {
      const { currentChapterIndex } = get();
      if (currentChapterIndex > 0) {
        set((state) => {
          state.currentChapterIndex -= 1;
          state.currentTime = 0;
          state.duration = 0;
          state.bookmarks = [];
        });
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
      TrackPlayer.reset();
    },
  }))
);
