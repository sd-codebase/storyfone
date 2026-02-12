import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/tabs/HomeScreen';
import { ExploreScreen } from '../screens/tabs/ExploreScreen';
import { LibraryScreen } from '../screens/tabs/LibraryScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator<TabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
