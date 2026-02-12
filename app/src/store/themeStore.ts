import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../constants/themes';

interface ThemeStore {
  mode: ThemeMode;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark',
      toggle: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'shrota-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
