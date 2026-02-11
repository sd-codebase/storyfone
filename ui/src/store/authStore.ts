import { create } from 'zustand';

const AUTH_TOKEN_KEY = 'auth_token';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(AUTH_TOKEN_KEY),

  setToken: (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  },
}));
