import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  progress: number; // 0-1
  height?: number;
}

export function ProgressBar({ progress, height = 3 }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.track, { height, backgroundColor: t.progressBg }]}>
      <LinearGradient
        colors={t.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress * 100))}%`, height }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: 2, overflow: 'hidden' },
  fill: { borderRadius: 2 },
});
