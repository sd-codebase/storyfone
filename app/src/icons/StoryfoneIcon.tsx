import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  G,
  Ellipse,
} from 'react-native-svg';
import type { ThemeColors } from '../constants/themes';

interface Props {
  size?: number;
  theme: ThemeColors;
}

export function StoryfoneIcon({ size = 32, theme }: Props) {
  const height = size * 1.45;
  const t = theme;

  return (
    <Svg width={size} height={height} viewBox="0 0 80 116">
      <Defs>
        {/* Phone body gradient */}
        <LinearGradient id="icon-pig" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={t.phoneFill1} />
          <Stop offset="100%" stopColor={t.phoneFill2} />
        </LinearGradient>
        {/* Screen gradient */}
        <LinearGradient id="icon-sig" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={t.screenBg1} />
          <Stop offset="100%" stopColor={t.screenBg2} />
        </LinearGradient>
      </Defs>

      {/* Phone */}
      <G transform="translate(10, 12)">
        {/* Phone body */}
        <Rect
          x={0}
          y={0}
          width={60}
          height={104}
          rx={13}
          fill="url(#icon-pig)"
          opacity={0.95}
        />
        {/* Screen */}
        <Rect x={5} y={14} width={50} height={70} rx={5} fill="url(#icon-sig)" />
        {/* Waveform on screen */}
        <Path
          d="M 12,49 L 17,49 L 20,35 L 23,62 L 26,38 L 29,55 L 32,49 L 36,49 L 39,37 L 42,60 L 45,41 L 49,49"
          stroke={t.primary}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom bar */}
        <Rect
          x={18}
          y={92}
          width={24}
          height={3}
          rx={1.5}
          fill={t.phoneDetail}
          opacity={0.4}
        />
      </G>

      {/* Headphones */}
      <G transform="translate(10, 12)">
        {/* Headband */}
        <Path
          d="M -4,22 C -4,-12 64,-12 64,22"
          stroke={t.headband}
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Left ear - outer */}
        <Ellipse
          cx={-4}
          cy={28}
          rx={9}
          ry={11}
          fill={t.earOuter}
          opacity={0.95}
        />
        {/* Left ear - inner */}
        <Ellipse cx={-4} cy={28} rx={6} ry={8} fill={t.earInner} />
        {/* Right ear - outer */}
        <Ellipse
          cx={64}
          cy={28}
          rx={9}
          ry={11}
          fill={t.earOuter}
          opacity={0.95}
        />
        {/* Right ear - inner */}
        <Ellipse cx={64} cy={28} rx={6} ry={8} fill={t.earInner} />
      </G>
    </Svg>
  );
}
