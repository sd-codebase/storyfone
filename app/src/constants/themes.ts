export type ThemeMode = 'dark' | 'light';

export type ThemeColors = {
  mode: ThemeMode;
  bg: string;
  bgSecondary: string;
  bgCard: string;
  bgCardHover: string;
  bgElevated: string;
  bgInput: string;
  primary: string;
  primaryGlow: string;
  primaryMuted: string;
  primarySoft: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  navBg: string;
  pulse: string;
  tag18: string;
  progressBg: string;
  starActive: string;
  starInactive: string;
  phoneFill1: string;
  phoneFill2: string;
  screenBg1: string;
  screenBg2: string;
  headband: string;
  earOuter: string;
  earInner: string;
  phoneDetail: string;
  pulseLineOpacity: number;
  gradientColors: [string, string];
  gradientSubtleColors: [string, string];
};

export const THEMES: Record<ThemeMode, ThemeColors> = {
  dark: {
    mode: 'dark',
    bg: '#0A0A0A',
    bgSecondary: '#141414',
    bgCard: '#1A1212',
    bgCardHover: '#221818',
    bgElevated: '#1E1616',
    bgInput: '#1A1212',
    primary: '#DC2626',
    primaryGlow: 'rgba(220, 38, 38, 0.3)',
    primaryMuted: '#991B1B',
    primarySoft: 'rgba(220, 38, 38, 0.08)',
    accent: '#FF4444',
    text: '#F5F0F0',
    textSecondary: '#9A8A8A',
    textMuted: '#6B5858',
    border: 'rgba(220, 38, 38, 0.12)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    navBg: 'rgba(10, 10, 10, 0.92)',
    pulse: '#DC2626',
    tag18: '#DC2626',
    progressBg: 'rgba(220, 38, 38, 0.15)',
    starActive: '#FF6B35',
    starInactive: '#3D2828',
    phoneFill1: '#FF4444',
    phoneFill2: '#C41919',
    screenBg1: '#1A0505',
    screenBg2: '#0D0000',
    headband: '#F5F0F0',
    earOuter: '#E8E0E0',
    earInner: '#D4CACA',
    phoneDetail: '#1A0505',
    pulseLineOpacity: 1,
    gradientColors: ['#DC2626', '#7F1D1D'] as [string, string],
    gradientSubtleColors: ['rgba(220,38,38,0.06)', 'transparent'] as [string, string],
  },
  light: {
    mode: 'light',
    bg: '#FBF7F5',
    bgSecondary: '#F5EFEC',
    bgCard: '#FFFFFF',
    bgCardHover: '#FFF8F6',
    bgElevated: '#FFFFFF',
    bgInput: '#F5EFEC',
    primary: '#B91C1C',
    primaryGlow: 'rgba(185, 28, 28, 0.15)',
    primaryMuted: '#7F1D1D',
    primarySoft: 'rgba(185, 28, 28, 0.06)',
    accent: '#DC2626',
    text: '#1C1111',
    textSecondary: '#6B5252',
    textMuted: '#9A8585',
    border: 'rgba(185, 28, 28, 0.12)',
    borderSubtle: 'rgba(0, 0, 0, 0.06)',
    navBg: 'rgba(251, 247, 245, 0.92)',
    pulse: '#B91C1C',
    tag18: '#B91C1C',
    progressBg: 'rgba(185, 28, 28, 0.1)',
    starActive: '#E85D4A',
    starInactive: '#E8DADA',
    phoneFill1: '#E03030',
    phoneFill2: '#A51515',
    screenBg1: '#FFF5F5',
    screenBg2: '#FFE8E8',
    headband: '#4A3535',
    earOuter: '#5C4848',
    earInner: '#3D2D2D',
    phoneDetail: '#D4B0B0',
    pulseLineOpacity: 0.9,
    gradientColors: ['#DC2626', '#991B1B'] as [string, string],
    gradientSubtleColors: ['rgba(185,28,28,0.04)', 'transparent'] as [string, string],
  },
};
