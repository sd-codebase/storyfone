import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types/navigation';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { PhoneScreen } from '../screens/auth/PhoneScreen';
import { BirthdateScreen } from '../screens/auth/BirthdateScreen';
import { PinSetupScreen } from '../screens/auth/PinSetupScreen';
import { NameScreen } from '../screens/auth/NameScreen';
import { LanguageScreen } from '../screens/auth/LanguageScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Phone" component={PhoneScreen} />
      <Stack.Screen name="Birthdate" component={BirthdateScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
