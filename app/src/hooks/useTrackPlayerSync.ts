import { useEffect, useRef } from 'react';
import TrackPlayer, {
  Event,
  State,
  useProgress,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { usePlayerStore, buildTracks, loadSession } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { recordListenTime } from '../api/user';
import { recordListen } from '../api/books';

const LISTEN_TIME_INTERVAL = 30_000; // 30 seconds
const PROGRESS_SAVE_INTERVAL = 5_000; // save local progress every 5s

/**
 * Mounted at App root — syncs TrackPlayer state → Zustand store.
 * Also tracks listen time, records listen counts, and persists listening progress.
 */
export function useTrackPlayerSync() {
  const { state: playbackState } = usePlaybackState();
  const { position, duration } = useProgress(500);

  const accumulatedTime = useRef(0);
  const totalListenTime = useRef(0);
  const lastPosition = useRef(0);
  const lastProgressSave = useRef(0);
  const restoredRef = useRef(false);

  // On startup: restore previous player session from AsyncStorage.
  // Re-adds tracks to TrackPlayer and shows mini player in paused state.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    (async () => {
      // Skip if store already has an active session (e.g. app was just backgrounded)
      if (usePlayerStore.getState().showMiniPlayer) return;

      const session = await loadSession();
      if (!session || !session.currentBook || session.chapters.length === 0) return;

      // Restore store state (shows mini player)
      usePlayerStore.getState().restoreSession(session);

      // Re-add tracks to TrackPlayer
      const queue = await TrackPlayer.getQueue();
      if (queue.length > 0) return;

      const tracks = buildTracks(session.currentBook, session.chapters);
      if (tracks.length === 0) return;

      await TrackPlayer.add(tracks);
      if (session.currentChapterIndex > 0 && session.currentChapterIndex < tracks.length) {
        await TrackPlayer.skip(session.currentChapterIndex);
      }
      if (session.currentTime > 0) {
        await TrackPlayer.seekTo(session.currentTime);
      }
      if (session.playbackSpeed !== 1) {
        await TrackPlayer.setRate(session.playbackSpeed);
      }
    })();
  }, []);

  // Sync progress + persist to libraryStore
  useEffect(() => {
    if (position >= 0) {
      usePlayerStore.getState().setCurrentTime(position);

      // Accumulate listen time (only forward progress, max 2s per tick to avoid seek jumps)
      const delta = position - lastPosition.current;
      if (delta > 0 && delta < 2) {
        accumulatedTime.current += delta;
        totalListenTime.current += delta;
      }
      lastPosition.current = position;

      // Enable rating after 60 seconds (position or accumulated time)
      if ((position >= 60 || totalListenTime.current >= 60) && !usePlayerStore.getState().canRate) {
        usePlayerStore.getState().setCanRate(true);
      }

      // Periodically save listening progress to libraryStore
      const now = Date.now();
      if (now - lastProgressSave.current > PROGRESS_SAVE_INTERVAL) {
        const { currentBook, currentChapterIndex, duration: dur } = usePlayerStore.getState();
        if (currentBook && dur > 0) {
          const chapterPercent = position / dur;
          const totalChapters = currentBook.chapters || 1;
          const overallPercent = (currentChapterIndex + chapterPercent) / totalChapters;
          useLibraryStore.getState().updateProgress(currentBook.id, {
            chapterIndex: currentChapterIndex,
            position,
            percent: Math.min(overallPercent, 1),
            lastPlayed: new Date().toISOString(),
          });
          lastProgressSave.current = now;
        }
      }
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

  // Periodic listen time saving to server (every 30s)
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


  // Sync chapter index on track change
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    if (event.index != null && event.index >= 0) {
      const store = usePlayerStore.getState();
      if (store.currentChapterIndex !== event.index) {
        store.setCurrentChapterIndex(event.index);
      }
    }
  });

  // Handle queue ended — flush remaining listen time + save final progress
  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    const seconds = Math.floor(accumulatedTime.current);
    const { currentBook, currentChapterIndex } = usePlayerStore.getState();
    const bookId = currentBook?.id;
    if (seconds > 0 && bookId) {
      recordListenTime(seconds, bookId).catch(() => {});
      accumulatedTime.current = 0;
    }
    // Save 100% progress on queue end
    if (currentBook) {
      useLibraryStore.getState().updateProgress(currentBook.id, {
        chapterIndex: currentChapterIndex,
        position: 0,
        percent: 1,
        lastPlayed: new Date().toISOString(),
      });
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
        totalListenTime.current = 0;
        lastPosition.current = 0;
        lastProgressSave.current = 0;
        // Record listen count for the new book
        if (bookId) {
          recordListen(bookId).catch(() => {});
        }
        prevBookIdRef.current = bookId;
      }
    });
    return unsub;
  }, []);

  // Save progress on pause
  useEffect(() => {
    if (playbackState === State.Paused) {
      const { currentBook, currentChapterIndex, duration: dur, currentTime } = usePlayerStore.getState();
      if (currentBook && dur > 0) {
        const chapterPercent = currentTime / dur;
        const totalChapters = currentBook.chapters || 1;
        const overallPercent = (currentChapterIndex + chapterPercent) / totalChapters;
        useLibraryStore.getState().updateProgress(currentBook.id, {
          chapterIndex: currentChapterIndex,
          position: currentTime,
          percent: Math.min(overallPercent, 1),
          lastPlayed: new Date().toISOString(),
        });
      }
    }
  }, [playbackState]);

}
