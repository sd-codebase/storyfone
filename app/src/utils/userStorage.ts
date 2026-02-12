import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

let _currentUserKey = '';

export function setCurrentUserKey(key: string) {
  _currentUserKey = key;
}

export function clearCurrentUserKey() {
  _currentUserKey = '';
}

export function createUserScopedStorage(): StateStorage {
  return {
    getItem: (name) => {
      const key = _currentUserKey ? `${_currentUserKey}:${name}` : name;
      return AsyncStorage.getItem(key);
    },
    setItem: (name, value) => {
      const key = _currentUserKey ? `${_currentUserKey}:${name}` : name;
      return AsyncStorage.setItem(key, value);
    },
    removeItem: (name) => {
      const key = _currentUserKey ? `${_currentUserKey}:${name}` : name;
      return AsyncStorage.removeItem(key);
    },
  };
}
