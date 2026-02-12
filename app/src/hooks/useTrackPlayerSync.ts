import { useEffect, useRef } from 'react';
import TrackPlayer, {
  Event,
  State,
  useProgress,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';
import { recordListenTime } from '../api/user';
import { recordListen } from '../api/books';

const LISTEN_TIME_INTERVAL = 30_000; // 30 seconds

/**
 * Mounted at App root — syncs TrackPlayer state → Zustand store.
 * Also tracks listen time and records listen counts.
 */
export function useTrackPlayerSync() {
  const { state: playbackState } = usePlaybackState();
  const { position, duration } = useProgress(500);

  const accumulatedTime = useRef(0);
  const lastPosition = useRef(0);
  const listenRecordedForBook = useRef<string | null>(null);

  // Sync progress
  useEffect(() => {
    if (position >= 0) {
      usePlayerStore.getState().setCurrentTime(position);

      // Accumulate listen time (only forward progress, max 2s per tick to avoid seek jumps)
      const delta = position - lastPosition.current;
      if (delta > 0 && delta < 2) {
        accumulatedTime.current += delta;
      }
      lastPosition.current = position;
    }
  }, [position]);

  useEffect(() => {
    if (duration > 0) {
      usePlayerStore.getState().setDuration(duration);
    }
  }, [duration]);

  // Sync isPlaying
  useEffect(() => {
    const store = usePlayerStore.getState();
    if (playbackState === State.Playing && !store.isPlaying) {
      store.setIsPlaying(true);
    } else if (
      (playbackState === State.Paused || playbackState === State.Stopped || playbackState === State.Ready) &&
      store.isPlaying
    ) {
      store.setIsPlaying(false);
    }
  }, [playbackState]);

  // Periodic listen time saving (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(accumulatedTime.current);
      const bookId = usePlayerStore.getState().currentBook?.id;
      if (seconds > 0 && bookId) {
        recordListenTime(seconds, bookId).catch(() => {});
        accumulatedTime.current = 0;
      }
    }, LISTEN_TIME_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Record listen count when a book starts playing (once per book load)
  useEffect(() => {
    const bookId = usePlayerStore.getState().currentBook?.id;
    if (playbackState === State.Playing && bookId && listenRecordedForBook.current !== bookId) {
      listenRecordedForBook.current = bookId;
      recordListen(bookId).catch(() => {});
    }
  }, [playbackState]);

  // Sync chapter index on track change
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    if (event.index != null && event.index >= 0) {
      const store = usePlayerStore.getState();
      if (store.currentChapterIndex !== event.index) {
        store.setCurrentChapterIndex(event.index);
      }
    }
  });

  // Handle queue ended — flush remaining listen time
  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    const seconds = Math.floor(accumulatedTime.current);
    const bookId = usePlayerStore.getState().currentBook?.id;
    if (seconds > 0 && bookId) {
      recordListenTime(seconds, bookId).catch(() => {});
      accumulatedTime.current = 0;
    }
    usePlayerStore.getState().setIsPlaying(false);
  });

  // Reset listen tracking when book changes
  const prevBookIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const unsub = usePlayerStore.subscribe((state) => {
      const bookId = state.currentBook?.id;
      if (bookId !== prevBookIdRef.current) {
        // Flush accumulated time for previous book
        const seconds = Math.floor(accumulatedTime.current);
        if (seconds > 0 && prevBookIdRef.current) {
          recordListenTime(seconds, prevBookIdRef.current).catch(() => {});
        }
        accumulatedTime.current = 0;
        lastPosition.current = 0;
        prevBookIdRef.current = bookId;
      }
    });
    return unsub;
  }, []);
}
