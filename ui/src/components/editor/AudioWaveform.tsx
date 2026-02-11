import { useRef, useEffect, useState, useCallback } from 'react';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import WaveSurfer from 'wavesurfer.js';

interface Props {
  audioUrl: string;
  height?: number;
  accentColor?: string;
  fadeIn?: number;
  fadeOut?: number;
  trimStart?: number;
  playDuration?: number;
}

export default function AudioWaveform({
  audioUrl,
  height = 24,
  accentColor = '#1890ff',
  fadeIn,
  fadeOut,
  trimStart = 0,
  playDuration,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Refs for trim/loop tracking
  const totalPlayedRef = useRef(0);
  const segmentStartRef = useRef(0);
  const loopingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      waveColor: '#555',
      progressColor: accentColor,
      url: audioUrl,
      normalize: true,
    });

    ws.on('ready', () => setReady(true));

    ws.on('finish', () => {
      // Clip reached its end — check if we need to loop
      if (loopingRef.current && playDuration !== undefined) {
        const clipDuration = ws.getDuration();
        const segmentLen = clipDuration - trimStart;
        totalPlayedRef.current += segmentLen;
        const remaining = playDuration - totalPlayedRef.current;

        if (remaining > 0.05) {
          // Loop back to trimStart for another iteration
          segmentStartRef.current = trimStart;
          ws.setTime(trimStart);
          ws.play();
          return;
        }
      }
      // Done — reset
      loopingRef.current = false;
      totalPlayedRef.current = 0;
      ws.setVolume(1);
      setPlaying(false);
    });

    ws.on('pause', () => {
      if (!loopingRef.current) {
        setPlaying(false);
      }
    });
    ws.on('play', () => setPlaying(true));

    ws.on('timeupdate', (currentTime: number) => {
      const clipDuration = ws.getDuration();
      if (!clipDuration) return;

      if (loopingRef.current && playDuration !== undefined) {
        const elapsedInSegment = currentTime - segmentStartRef.current;
        const totalElapsed = totalPlayedRef.current + elapsedInSegment;

        // Check if we've reached the desired play duration
        if (totalElapsed >= playDuration - 0.05) {
          loopingRef.current = false;
          totalPlayedRef.current = 0;
          ws.pause();
          ws.setVolume(1);
          setPlaying(false);
          return;
        }

        // Fades relative to total play envelope
        let vol = 1;
        if (fadeIn && fadeIn > 0 && totalElapsed < fadeIn) {
          vol = Math.min(vol, totalElapsed / fadeIn);
        }
        if (fadeOut && fadeOut > 0 && totalElapsed > playDuration - fadeOut) {
          vol = Math.min(vol, (playDuration - totalElapsed) / fadeOut);
        }
        ws.setVolume(Math.max(0, Math.min(1, vol)));
      } else {
        // No duration set — simple single-pass with fades relative to clip
        const effectiveEnd = clipDuration;
        const effectiveStart = trimStart;
        const effectiveDuration = effectiveEnd - effectiveStart;
        const elapsed = currentTime - effectiveStart;

        let vol = 1;
        if (fadeIn && fadeIn > 0 && elapsed < fadeIn) {
          vol = Math.min(vol, elapsed / fadeIn);
        }
        if (fadeOut && fadeOut > 0 && elapsed > effectiveDuration - fadeOut) {
          vol = Math.min(vol, (effectiveDuration - elapsed) / fadeOut);
        }
        ws.setVolume(Math.max(0, Math.min(1, vol)));
      }
    });

    wsRef.current = ws;

    return () => {
      loopingRef.current = false;
      totalPlayedRef.current = 0;
      ws.destroy();
      wsRef.current = null;
      setPlaying(false);
      setReady(false);
    };
  }, [audioUrl, height, accentColor, fadeIn, fadeOut, trimStart, playDuration]);

  const toggle = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) return;

    if (playing) {
      // Stop
      loopingRef.current = false;
      totalPlayedRef.current = 0;
      ws.pause();
      ws.setVolume(1);
      setPlaying(false);
      return;
    }

    // Start playback
    totalPlayedRef.current = 0;
    segmentStartRef.current = trimStart;

    if (playDuration !== undefined) {
      loopingRef.current = true;
    } else {
      loopingRef.current = false;
    }

    // Set initial volume for fade-in
    if (fadeIn && fadeIn > 0) {
      ws.setVolume(0);
    } else {
      ws.setVolume(1);
    }

    ws.setTime(trimStart);
    ws.play();
  }, [playing, fadeIn, trimStart, playDuration]);

  const Icon = playing ? PauseCircleOutlined : PlayCircleOutlined;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        minWidth: 0,
        opacity: ready ? 1 : 0.4,
      }}
    >
      <Icon
        style={{ color: accentColor, cursor: 'pointer', fontSize: 18, flexShrink: 0 }}
        onClick={toggle}
      />
      <div
        ref={containerRef}
        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
        onClick={toggle}
      />
    </div>
  );
}
