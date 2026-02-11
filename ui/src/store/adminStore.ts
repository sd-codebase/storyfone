import { create } from 'zustand';

export type AppMode = 'editor' | 'admin';
export type AdminSection = 'languages' | 'genres' | 'authors' | 'narrators' | 'users' | 'books';

interface AdminState {
  appMode: AppMode;
  activeSection: AdminSection;
  setAppMode: (mode: AppMode) => void;
  setActiveSection: (section: AdminSection) => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  appMode: 'editor',
  activeSection: 'languages',
  setAppMode: (mode) => set({ appMode: mode }),
  setActiveSection: (section) => set({ activeSection: section }),
}));
