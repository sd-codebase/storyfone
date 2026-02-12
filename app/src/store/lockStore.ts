import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as userApi from '../api/user';
import { createUserScopedStorage } from '../utils/userStorage';

interface LockStore {
  isUnlocked: boolean;
  hasPin: boolean;
  createPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  lock: () => void;
  checkHasPin: () => Promise<void>;
}

export const useLockStore = create<LockStore>()(
  persist(
    (set) => ({
      isUnlocked: false,
      hasPin: false,
      createPin: async (pin: string) => {
        await userApi.createPin(pin);
        set({ isUnlocked: true, hasPin: true });
      },
      verifyPin: async (pin: string) => {
        const valid = await userApi.verifyPin(pin);
        if (valid) set({ isUnlocked: true });
        return valid;
      },
      lock: () => set({ isUnlocked: false }),
      checkHasPin: async () => {
        try {
          const has = await userApi.checkPinExists();
          set({ hasPin: has });
        } catch {
          set({ hasPin: false });
        }
      },
    }),
    {
      name: 'storyfone-lock',
      storage: createJSONStorage(() => createUserScopedStorage()),
      partialize: (state) => ({ isUnlocked: state.isUnlocked, hasPin: state.hasPin }),
    },
  ),
);
