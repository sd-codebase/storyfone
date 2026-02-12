import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const t = useTheme();

  const navTheme = {
    ...(t.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(t.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: t.bg,
      card: t.bgCard,
      text: t.text,
      border: t.border,
      primary: t.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
