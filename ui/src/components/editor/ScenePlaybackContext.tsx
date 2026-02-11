import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { SceneElement, SfxElement, BgmElement } from '../../types/script';
import { ElementType } from '../../types/script';
import { getAudioFileUrl, getTtsAudioUrl } from '../../api/client';

interface PlaybackState {
  playingElementId: string | null;
  isPlaying: boolean;
  /** Remaining seconds for the current pause element (null if not a pause) */
  pauseRemaining: number | null;
}

interface PlaybackActions {
  playScene: (elements: SceneElement[]) => void;
  stopScene: () => void;
}

const PlaybackContext = createContext<(PlaybackState & PlaybackActions) | null>(null);

export function useScenePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('useScenePlayback must be used within ScenePlaybackProvider');
  return ctx;
}

function getAudioUrl(element: SceneElement): string | null {
  if (element.type === ElementType.SFX || element.type === ElementType.BGM) {
    const el = element as SfxElement | BgmElement;
    return el.audioFileId ? getAudioFileUrl(el.audioFileId) : null;
  }
  if (element.type === ElementType.DIALOGUE) {
    return element.audioUrl ? getTtsAudioUrl(element.audioUrl) : null;
  }
  return null;
}

/**
 * Play an audio element with trim-start + duration-looping support.
 *
 * Logic:
 *   trimStart = timing.trim_start ?? 0
 *   desiredDuration = timing.duration (undefined = play once from trimStart to end)
 *   segmentLength = clipDuration - trimStart
 *
 *   Case 1: No duration → play from trimStart to clip end, no loop
 *   Case 2: duration ≤ segmentLength → play from trimStart, stop after duration
 *   Case 3: duration > segmentLength → play from trimStart to end, loop back, repeat until total = duration
 *
 * Fade-in/fade-out apply to the **total play envelope**, not per-loop-iteration.
 */
function playAudioElement(
  element: SceneElement,
  signal: AbortSignal,
): Promise<void> {
  const url = getAudioUrl(element);
  if (!url) return Promise.resolve();

  const isSfxBgm = element.type === ElementType.SFX || element.type === ElementType.BGM;
  const timing = isSfxBgm ? (element as SfxElement | BgmElement).timing : undefined;

  const trimStart = timing?.trim_start ?? 0;
  const desiredDuration = timing?.duration;
  const fadeIn = timing?.fade_in ?? 0;
  const fadeOut = timing?.fade_out ?? 0;

  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);
    let totalPlayed = 0;
    let segmentStart = trimStart;
    let cleanedUp = false;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };

    /** Compute volume based on total elapsed time in the play envelope */
    function computeVolume(totalElapsed: number, totalDur: number): number {
      let vol = 1;
      if (fadeIn > 0 && totalElapsed < fadeIn) {
        vol = Math.min(vol, totalElapsed / fadeIn);
      }
      if (fadeOut > 0 && totalElapsed > totalDur - fadeOut) {
        vol = Math.min(vol, (totalDur - totalElapsed) / fadeOut);
      }
      return Math.max(0, Math.min(1, vol));
    }

    // For non SFX/BGM (dialogue) — simple play, no trim/loop
    if (!isSfxBgm) {
      audio.addEventListener('ended', () => { cleanup(); resolve(); }, { once: true });
      audio.addEventListener('error', () => { cleanup(); resolve(); }, { once: true });
      if (signal.aborted) { cleanup(); reject(new DOMException('Aborted', 'AbortError')); return; }
      signal.addEventListener('abort', () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
      audio.play().catch(() => { cleanup(); resolve(); });
      return;
    }

    // Wait for metadata to know clip duration
    const onCanPlay = () => {
      const clipDuration = audio.duration;
      if (!Number.isFinite(clipDuration)) { cleanup(); resolve(); return; }

      // Determine the effective total play duration
      const segmentLength = clipDuration - trimStart;
      // If no desired duration, play once from trimStart to end
      const effectiveDuration = desiredDuration ?? segmentLength;

      // Seek to trim start
      audio.currentTime = trimStart;
      segmentStart = trimStart;

      // Set initial volume
      audio.volume = (fadeIn > 0) ? 0 : 1;

      const onTimeUpdate = () => {
        if (cleanedUp) return;
        const elapsedInSegment = audio.currentTime - segmentStart;
        const totalElapsed = totalPlayed + elapsedInSegment;

        // Stop if we've reached desired duration
        if (totalElapsed >= effectiveDuration - 0.05) {
          cleanup();
          resolve();
          return;
        }

        // Apply fades to the total envelope
        audio.volume = computeVolume(totalElapsed, effectiveDuration);
      };

      const onEnded = () => {
        if (cleanedUp) return;
        // Clip ended naturally — accumulate played time
        const elapsedInSegment = clipDuration - segmentStart;
        totalPlayed += elapsedInSegment;

        if (totalPlayed >= effectiveDuration - 0.05) {
          cleanup();
          resolve();
          return;
        }

        // Loop: seek back to trimStart and continue
        segmentStart = trimStart;
        audio.currentTime = trimStart;
        audio.volume = computeVolume(totalPlayed, effectiveDuration);
        audio.play().catch(() => { cleanup(); resolve(); });
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);

      audio.play().catch(() => { cleanup(); resolve(); });
    };

    audio.addEventListener('canplaythrough', onCanPlay, { once: true });
    audio.addEventListener('error', () => { cleanup(); resolve(); }, { once: true });

    if (signal.aborted) { cleanup(); reject(new DOMException('Aborted', 'AbortError')); return; }
    signal.addEventListener('abort', () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });

    // Trigger load
    audio.load();
  });
}

function waitPause(
  durationSec: number,
  signal: AbortSignal,
  onTick: (remaining: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }

    const startTime = Date.now();
    const totalMs = durationSec * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (totalMs - elapsed) / 1000);
      onTick(remaining);
    }, 100);

    const timer = setTimeout(() => {
      clearInterval(interval);
      onTick(0);
      resolve();
    }, totalMs);

    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      clearInterval(interval);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

export function ScenePlaybackProvider({ children }: { children: ReactNode }) {
  const [playingElementId, setPlayingElementId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pauseRemaining, setPauseRemaining] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopScene = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPlayingElementId(null);
    setIsPlaying(false);
    setPauseRemaining(null);
  }, []);

  const playScene = useCallback((elements: SceneElement[]) => {
    // Stop any existing playback first
    abortRef.current?.abort();

    const ac = new AbortController();
    abortRef.current = ac;
    setIsPlaying(true);

    const sorted = [...elements].sort((a, b) => a.order - b.order);

    (async () => {
      try {
        for (const el of sorted) {
          if (ac.signal.aborted) break;

          setPlayingElementId(el.id);
          setPauseRemaining(null);

          if (el.type === ElementType.PAUSE) {
            if (el.duration > 0) {
              setPauseRemaining(el.duration);
              await waitPause(el.duration, ac.signal, (r) => setPauseRemaining(r));
            }
          } else if (el.type === ElementType.BGM) {
            // BGM plays in background — don't block the sequence
            playAudioElement(el, ac.signal).catch(() => {});
            // Brief overlap delay before next element starts
            await new Promise<void>((resolve, reject) => {
              const t = setTimeout(resolve, 750);
              ac.signal.addEventListener('abort', () => {
                clearTimeout(t);
                reject(new DOMException('Aborted', 'AbortError'));
              }, { once: true });
            });
          } else {
            await playAudioElement(el, ac.signal);
          }
        }
      } catch {
        // AbortError — expected on stop
      } finally {
        // Stop any background BGM still playing
        ac.abort();
        setPlayingElementId(null);
        setIsPlaying(false);
        setPauseRemaining(null);
        if (abortRef.current === ac) abortRef.current = null;
      }
    })();
  }, []);

  return (
    <PlaybackContext.Provider value={{ playingElementId, isPlaying, pauseRemaining, playScene, stopScene }}>
      {children}
    </PlaybackContext.Provider>
  );
}
