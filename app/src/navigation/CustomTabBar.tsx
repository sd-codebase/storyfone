import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { usePlayerStore } from '../store/playerStore';
import { MiniPlayer } from '../components/player/MiniPlayer';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';

const TAB_ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  Home: 'home',
  Explore: 'compass',
  Library: 'book-open',
  Profile: 'user',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { showMiniPlayer, currentBook } = usePlayerStore();

  return (
    <View style={{ backgroundColor: t.navBg }}>
      {showMiniPlayer && currentBook && <MiniPlayer />}
      <View style={[styles.container, { borderTopColor: t.borderSubtle, paddingBottom: insets.bottom || 16 }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconName = TAB_ICONS[route.name] || 'circle';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7}>
              {isFocused && (
                <LinearGradient colors={t.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.indicator} />
              )}
              <Feather name={iconName} size={22} color={isFocused ? t.primary : t.textMuted} />
              <Text style={[styles.label, { color: isFocused ? t.primary : t.textMuted, fontWeight: isFocused ? '700' : '500' }]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4, position: 'relative' },
  indicator: { position: 'absolute', top: -8, width: 20, height: 3, borderRadius: 2 },
  label: { fontSize: 10 },
});
