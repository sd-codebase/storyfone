import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { usePlayerStore } from './playerStore';
import * as authApi from '../api/auth';
import { getMe } from '../api/user';
import type { ApiUser } from '../api/auth';

interface AppUser {
  id: string;
  name: string;
  whatsapp: string;
  countryCode: string;
  birthYear: number;
  plan: string;
  memberSince: string;
  isVerified: boolean;
  createdAt: string;
  preferredLanguages: string[];
  pendingWhatsapp?: string;
  pendingCountryCode?: string;
  hasPendingWhatsapp: boolean;
}

function mapApiUser(u: ApiUser): AppUser {
  const memberSince = u.created_at
    ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';
  return {
    id: u.id,
    name: u.name || 'Night Listener',
    whatsapp: u.whatsapp_number,
    countryCode: u.country_code,
    birthYear: u.birth_year,
    plan: u.plan,
    memberSince,
    isVerified: u.is_verified,
    createdAt: u.created_at,
    preferredLanguages: u.preferred_languages || [],
    pendingWhatsapp: u.pending_whatsapp_number ?? undefined,
    pendingCountryCode: u.pending_country_code ?? undefined,
    hasPendingWhatsapp: u.has_pending_whatsapp,
  };
}

interface AuthStore {
  token: string | null;
  user: AppUser | null;
  isAuthenticated: boolean;
  isAdult: boolean;
  setAuth: (token: string, user: AppUser, isAdult: boolean) => void;
  setUser: (user: AppUser) => void;
  logout: () => void;
  loadToken: () => Promise<void>;
  register: (whatsapp: string, countryCode: string, birthYear: number, pin: string, name: string, preferredLanguages: string[]) => Promise<void>;
  loginWithPhone: (whatsapp: string, countryCode: string, pin: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isAdult: false,
  setAuth: async (token, user, isAdult) => {
    await SecureStore.setItemAsync('auth_token', token);
    set({ token, user, isAuthenticated: true, isAdult });
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    usePlayerStore.getState().dismiss();
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null, isAuthenticated: false, isAdult: false });
  },
  loadToken: async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) return;
    set({ token });
    try {
      const apiUser = await getMe();
      set({ user: mapApiUser(apiUser), isAuthenticated: true, isAdult: apiUser.is_adult });
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      set({ token: null, isAuthenticated: false });
    }
  },
  register: async (whatsapp, countryCode, birthYear, pin, name, preferredLanguages) => {
    const res = await authApi.register(whatsapp, countryCode, birthYear, pin, name, preferredLanguages);
    await SecureStore.setItemAsync('auth_token', res.access_token);
    set({
      token: res.access_token,
      user: mapApiUser(res.user),
      isAuthenticated: true,
      isAdult: res.user.is_adult,
    });
  },
  loginWithPhone: async (whatsapp, countryCode, pin) => {
    const res = await authApi.login(whatsapp, countryCode, pin);
    await SecureStore.setItemAsync('auth_token', res.access_token);
    set({
      token: res.access_token,
      user: mapApiUser(res.user),
      isAuthenticated: true,
      isAdult: res.user.is_adult,
    });
  },
}));
