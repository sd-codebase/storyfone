import { THEMES } from '../constants/themes';
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  return THEMES[mode];
}
