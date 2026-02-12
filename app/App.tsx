import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from './src/store/themeStore';
import { useAuthStore } from './src/store/authStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupPlayer } from './src/services/trackPlayer';
import { useTrackPlayerSync } from './src/hooks/useTrackPlayerSync';
import { useInactivityLock } from './src/hooks/useInactivityLock';
import { setCurrentUserKey, clearCurrentUserKey } from './src/utils/userStorage';
import { useLibraryStore } from './src/store/libraryStore';

function TrackPlayerSync() {
  useTrackPlayerSync();
  return null;
}

function InactivityLockGuard() {
  useInactivityLock();
  return null;
}

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const [playerReady, setPlayerReady] = useState(false);
  const { isAuthenticated, isAdult, user } = useAuthStore();

  useEffect(() => {
    setupPlayer()
      .then(() => setPlayerReady(true))
      .catch(() => setPlayerReady(true));
  }, []);

  // Set user-scoped storage key when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentUserKey(user.countryCode + user.whatsapp);
      useLibraryStore.persist.rehydrate();
    } else {
      clearCurrentUserKey();
    }
  }, [isAuthenticated, user?.whatsapp]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        {playerReady && <TrackPlayerSync />}
        {isAuthenticated && isAdult && <InactivityLockGuard />}
        <RootNavigator />
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
