import React from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function EighteenPlus({ size = 28, color = '#DC2626' }: Props) {
  return (
    <Svg width={size} height={size * 0.65} viewBox="0 0 36 22">
      <Rect x={0} y={0} width={36} height={22} rx={4} fill={color} />
      <SvgText
        x={18}
        y={16}
        textAnchor="middle"
        fontSize={13}
        fontWeight="bold"
        fill="#FFFFFF"
      >
        18+
      </SvgText>
    </Svg>
  );
}
