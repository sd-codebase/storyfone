import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../types/navigation';
import { MainTabs } from './MainTabs';
import { StoryDetailScreen } from '../screens/StoryDetailScreen';
import { FullPlayerScreen } from '../screens/FullPlayerScreen';
import { LockScreen } from '../screens/LockScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
      <Stack.Screen name="FullPlayer" component={FullPlayerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="LockScreen" component={LockScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
