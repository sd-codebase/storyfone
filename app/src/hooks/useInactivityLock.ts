import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useLockStore } from '../store/lockStore';

const LOCK_AFTER_MS = 30 * 60 * 1000; // 30 minutes

export function useInactivityLock() {
  const backgroundAt = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundAt.current = Date.now();
      } else if (nextState === 'active' && backgroundAt.current) {
        const elapsed = Date.now() - backgroundAt.current;
        backgroundAt.current = null;
        if (elapsed >= LOCK_AFTER_MS) {
          const { isUnlocked, lock } = useLockStore.getState();
          if (isUnlocked) {
            lock();
          }
        }
      }
    });
    return () => sub.remove();
  }, []);
}
