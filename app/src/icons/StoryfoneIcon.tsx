import React from 'react';
import Svg, { Image as SvgImage } from 'react-native-svg';
import type { ThemeColors } from '../constants/themes';

const iconAsset = require('../../assets/storytfone-app-icon.png');

interface Props {
  size?: number;
  theme: ThemeColors;
}

export function StoryfoneIcon({ size = 32 }: Props) {
  // Source image is 595x780 (~0.76 aspect ratio)
  const height = size * (780 / 595);

  return (
    <Svg width={size} height={height} viewBox="0 0 595 780">
      <SvgImage
        x={0}
        y={0}
        width={595}
        height={780}
        href={iconAsset}
      />
    </Svg>
  );
}
