export const PlaybackSpeed = {
  HALF: 0.5,
  THREE_QUARTER: 0.75,
  NORMAL: 1,
  QUARTER_FAST: 1.25,
  HALF_FAST: 1.5,
  DOUBLE: 2,
} as const;

export type PlaybackSpeed = (typeof PlaybackSpeed)[keyof typeof PlaybackSpeed];

export const SleepTimerOption = {
  OFF: null,
  FIFTEEN: 15,
  THIRTY: 30,
  FORTY_FIVE: 45,
  SIXTY: 60,
  END_CHAPTER: 'chapter',
} as const;

export type SleepTimerValue = null | 15 | 30 | 45 | 60 | 'chapter';

export interface PlayerState {
  currentBookId: string | null;
  currentChapterIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: PlaybackSpeed;
  sleepTimer: SleepTimerValue;
  showMiniPlayer: boolean;
  bookmarks: number[];
}
