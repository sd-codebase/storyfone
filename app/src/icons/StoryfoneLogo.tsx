import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  G,
  Ellipse,
  Text as SvgText,
} from 'react-native-svg';
import type { ThemeColors } from '../constants/themes';

interface Props {
  width?: number;
  theme: ThemeColors;
  animate?: boolean;
}

export function StoryfoneLogo({ width = 260, theme }: Props) {
  const scale = width / 380;
  const height = 140 * scale;
  const t = theme;

  return (
    <Svg width={width} height={height} viewBox="0 0 380 140">
      <Defs>
        {/* Pulse line gradient */}
        <LinearGradient id="logo-pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={t.primary} stopOpacity={0.15} />
          <Stop offset="25%" stopColor={t.primary} stopOpacity={1} />
          <Stop offset="75%" stopColor={t.primary} stopOpacity={1} />
          <Stop offset="100%" stopColor={t.primary} stopOpacity={0.2} />
        </LinearGradient>
        {/* Phone body gradient */}
        <LinearGradient id="logo-phg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={t.phoneFill1} />
          <Stop offset="100%" stopColor={t.phoneFill2} />
        </LinearGradient>
        {/* Screen gradient */}
        <LinearGradient id="logo-scg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={t.screenBg1} />
          <Stop offset="100%" stopColor={t.screenBg2} />
        </LinearGradient>
      </Defs>

      {/* Heartbeat pulse */}
      <Path
        d="M 0,70 L 28,70 L 38,70 L 48,28 L 58,105 L 68,42 L 76,85 L 84,70 L 98,70"
        stroke="url(#logo-pg)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={t.pulseLineOpacity}
      />

      {/* "story" text */}
      <SvgText
        x={100}
        y={86}
        fontFamily="Georgia, serif"
        fontSize={54}
        fontWeight="bold"
        fill={t.primary}
        letterSpacing={-1}
      >
        story
      </SvgText>

      {/* Connecting line */}
      <Path
        d="M 242,70 L 272,70"
        stroke={t.primary}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* Phone */}
      <G transform="translate(272, 12)">
        {/* Phone body */}
        <Rect
          x={0}
          y={0}
          width={60}
          height={116}
          rx={13}
          fill="url(#logo-phg)"
          opacity={0.95}
        />
        {/* Screen */}
        <Rect
          x={5}
          y={14}
          width={50}
          height={80}
          rx={5}
          fill="url(#logo-scg)"
        />
        {/* Waveform on screen */}
        <Path
          d="M 12,54 L 17,54 L 20,38 L 23,68 L 26,42 L 29,60 L 32,54 L 36,54 L 39,40 L 42,66 L 45,45 L 49,54"
          stroke={t.primary}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom bar */}
        <Rect
          x={18}
          y={102}
          width={24}
          height={3}
          rx={1.5}
          fill={t.phoneDetail}
          opacity={0.4}
        />
        {/* Top notch */}
        <Rect
          x={20}
          y={5}
          width={20}
          height={3}
          rx={1.5}
          fill={t.phoneDetail}
          opacity={0.35}
        />
      </G>

      {/* Headphones */}
      <G transform="translate(272, 12)">
        {/* Headband */}
        <Path
          d="M -6,28 C -6,-12 66,-12 66,28"
          stroke={t.headband}
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Left ear - outer */}
        <Ellipse
          cx={-6}
          cy={34}
          rx={9}
          ry={12}
          fill={t.earOuter}
          opacity={0.95}
        />
        {/* Left ear - inner */}
        <Ellipse cx={-6} cy={34} rx={6} ry={9} fill={t.earInner} />
        {/* Right ear - outer */}
        <Ellipse
          cx={66}
          cy={34}
          rx={9}
          ry={12}
          fill={t.earOuter}
          opacity={0.95}
        />
        {/* Right ear - inner */}
        <Ellipse cx={66} cy={34} rx={6} ry={9} fill={t.earInner} />
        {/* Mic arm */}
        <Path
          d="M -3,43 C -3,60 14,66 19,66"
          stroke={t.earInner}
          strokeWidth={2.8}
          fill="none"
          strokeLinecap="round"
        />
        {/* Mic head - outer */}
        <Ellipse cx={20} cy={66} rx={4.5} ry={5} fill={t.earInner} />
        {/* Mic head - inner */}
        <Ellipse
          cx={20}
          cy={66}
          rx={2.5}
          ry={3}
          fill={t.earOuter}
          opacity={0.5}
        />
      </G>
    </Svg>
  );
}
