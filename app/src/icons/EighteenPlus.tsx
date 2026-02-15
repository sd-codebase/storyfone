import React from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function EighteenPlus({ size = 32, color = '#DC2626' }: Props) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 40 24">
      <Rect x={0} y={0} width={40} height={24} rx={5} fill={color} />
      <SvgText
        x={20}
        y={17.5}
        textAnchor="middle"
        fontSize={15}
        fontWeight="bold"
        fill="#FFFFFF"
      >
        18+
      </SvgText>
    </Svg>
  );
}
