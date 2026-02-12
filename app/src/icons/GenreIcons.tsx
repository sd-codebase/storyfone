import React from 'react';
import Svg, { Circle, Path, Ellipse, Rect, Line, Polyline } from 'react-native-svg';

interface Props {
  size?: number;
}

function RomanceIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Path d="M32 50 C32 50 12 36 12 24 C12 18 17 14 22 14 C26 14 29 16 32 20 C35 16 38 14 42 14 C47 14 52 18 52 24 C52 36 32 50 32 50Z" fill="#CC3333" />
      <Path d="M22 20 C24 17 28 17 30 20" fill="none" stroke="#E85555" strokeWidth={2} strokeLinecap="round" />
      <Path d="M32 44 C32 44 20 34 20 26 C20 22 23 20 26 20 C28.5 20 30.5 21.5 32 24 C33.5 21.5 35.5 20 38 20 C41 20 44 22 44 26 C44 34 32 44 32 44Z" fill="#E85555" opacity={0.4} />
    </Svg>
  );
}

function ThrillerIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Polyline
        points="6,32 16,32 20,18 24,46 28,24 32,40 36,28 40,36 44,30 48,32 58,32"
        stroke="#CC3333"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={32} cy={32} r={4} fill="#CC3333" opacity={0.3} />
      <Circle cx={32} cy={32} r={3} fill="#E85555" />
    </Svg>
  );
}

function MysteryIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Path d="M14 26 C14 26 16 18 32 18 C48 18 50 26 50 26 L50 34 C50 34 48 40 42 40 C38 40 36 36 32 36 C28 36 26 40 22 40 C16 40 14 34 14 34 Z" fill="#CC3333" />
      <Ellipse cx={24} cy={29} rx={5} ry={4} fill="#1A1A1A" />
      <Ellipse cx={40} cy={29} rx={5} ry={4} fill="#1A1A1A" />
      <Path d="M28 48 C28 44 30 43 32 42 C34 41 35 40 35 38 C35 36 33.5 35 32 35 C30.5 35 29 36 29 37" fill="none" stroke="#E85555" strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={28} cy={51} r={1.5} fill="#E85555" />
    </Svg>
  );
}

function HorrorIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Path d="M20 30 C20 20 25 14 32 14 C39 14 44 20 44 30 C44 36 42 38 40 40 L40 46 L24 46 L24 40 C22 38 20 36 20 30Z" fill="#CC3333" />
      <Ellipse cx={27} cy={28} rx={4} ry={4.5} fill="#1A1A1A" />
      <Ellipse cx={37} cy={28} rx={4} ry={4.5} fill="#1A1A1A" />
      <Circle cx={27} cy={28} r={1.5} fill="#E85555" />
      <Circle cx={37} cy={28} r={1.5} fill="#E85555" />
      <Path d="M30 34 L32 37 L34 34" fill="#1A1A1A" />
      <Line x1={27} y1={40} x2={27} y2={46} stroke="#1A1A1A" strokeWidth={1.5} />
      <Line x1={32} y1={40} x2={32} y2={46} stroke="#1A1A1A" strokeWidth={1.5} />
      <Line x1={37} y1={40} x2={37} y2={46} stroke="#1A1A1A" strokeWidth={1.5} />
      <Path d="M32 14 L30 20 L33 22" stroke="#991B1B" strokeWidth={1} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function CrimeIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Path d="M32 14c-10 0-16 8-16 18" stroke="#CC3333" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M32 18c-7.5 0-12 6-12 14" stroke="#991B1B" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M32 22c-5 0-8 4.5-8 10s3 10 8 10" stroke="#CC3333" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M32 26c-2.5 0-4 2.5-4 6s1.5 6 4 6 4-2.5 4-6" stroke="#E85555" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M32 22c5 0 8 4.5 8 10" stroke="#991B1B" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M32 18c7.5 0 12 6 12 14" stroke="#CC3333" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M32 14c10 0 16 8 16 18" stroke="#991B1B" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Line x1={32} y1={8} x2={32} y2={12} stroke="#E85555" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={32} y1={52} x2={32} y2={56} stroke="#E85555" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={8} y1={32} x2={12} y2={32} stroke="#E85555" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={52} y1={32} x2={56} y2={32} stroke="#E85555" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function CourtDramaIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Rect x={18} y={18} width={20} height={10} rx={2} fill="#CC3333" transform="rotate(-35 28 23)" />
      <Line x1={30} y1={28} x2={46} y2={44} stroke="#991B1B" strokeWidth={3.5} strokeLinecap="round" />
      <Rect x={14} y={44} width={22} height={5} rx={1.5} fill="#E85555" />
      <Line x1={20} y1={42} x2={16} y2={38} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={25} y1={41} x2={25} y2={36} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={30} y1={42} x2={34} y2={38} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={48} y1={14} x2={48} y2={26} stroke="#991B1B" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={42} y1={16} x2={54} y2={16} stroke="#991B1B" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M42 16 L40 22 L44 22 Z" fill="#991B1B" />
      <Path d="M54 16 L52 22 L56 22 Z" fill="#991B1B" />
    </Svg>
  );
}

function EroticaIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Path d="M32 12 C32 12 22 26 22 38 C22 44 26.5 50 32 50 C37.5 50 42 44 42 38 C42 26 32 12 32 12Z" fill="#CC3333" />
      <Path d="M32 24 C32 24 26 32 26 39 C26 43 28.5 46 32 46 C35.5 46 38 43 38 39 C38 32 32 24 32 24Z" fill="#E85555" />
      <Path d="M32 34 C32 34 29 38 29 41 C29 43 30.3 44.5 32 44.5 C33.7 44.5 35 43 35 41 C35 38 32 34 32 34Z" fill="#FFB3B3" />
    </Svg>
  );
}

function InvestigationIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Circle cx={28} cy={28} r={12} fill="none" stroke="#CC3333" strokeWidth={3} />
      <Line x1={37} y1={37} x2={50} y2={50} stroke="#CC3333" strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M22 22 C24 18 30 17 34 20" fill="none" stroke="#E85555" strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={26} cy={30} r={1.5} fill="#991B1B" />
      <Circle cx={30} cy={26} r={1.5} fill="#991B1B" />
      <Circle cx={28} cy={32} r={1} fill="#E85555" />
      <Line x1={28} y1={20} x2={28} y2={36} stroke="#991B1B" strokeWidth={0.8} strokeDasharray="2 2" />
      <Line x1={20} y1={28} x2={36} y2={28} stroke="#991B1B" strokeWidth={0.8} strokeDasharray="2 2" />
    </Svg>
  );
}

function SuspenseIcon({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={30} fill="#1A1A1A" />
      <Path d="M8 32 C8 32 18 18 32 18 C46 18 56 32 56 32 C56 32 46 46 32 46 C18 46 8 32 8 32Z" fill="none" stroke="#CC3333" strokeWidth={2.5} />
      <Circle cx={32} cy={32} r={9} fill="#991B1B" />
      <Circle cx={32} cy={32} r={4.5} fill="#1A1A1A" />
      <Circle cx={35} cy={29} r={2} fill="#E85555" />
      <Line x1={24} y1={12} x2={24} y2={16} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={32} y1={10} x2={32} y2={14} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={40} y1={12} x2={40} y2={16} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={24} y1={48} x2={24} y2={52} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={32} y1={50} x2={32} y2={54} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={40} y1={48} x2={40} y2={52} stroke="#CC3333" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export const GENRE_ICONS: Record<string, React.FC<{ size?: number }>> = {
  Romance: RomanceIcon,
  Thriller: ThrillerIcon,
  Mystery: MysteryIcon,
  Horror: HorrorIcon,
  Crime: CrimeIcon,
  'Court Drama': CourtDramaIcon,
  'Court-Drama': CourtDramaIcon,
  Erotica: EroticaIcon,
  Investigation: InvestigationIcon,
  Suspense: SuspenseIcon,
};
