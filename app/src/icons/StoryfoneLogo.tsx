import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Text as SvgText,
  Image as SvgImage,
} from 'react-native-svg';
import type { ThemeColors } from '../constants/themes';

const iconAsset = require('../../assets/storytfone-app-icon.png');

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
        d="M 242,70 L 262,70"
        stroke={t.primary}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* Phone + Headphones image */}
      <SvgImage
        x={265}
        y={15}
        width={70}
        height={92}
        href={iconAsset}
      />
    </Svg>
  );
}
