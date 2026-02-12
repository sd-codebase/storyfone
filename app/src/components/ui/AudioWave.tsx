import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props {
  color: string;
  playing: boolean;
  barCount?: number;
}

export function AudioWave({ color, playing, barCount = 5 }: Props) {
  const anims = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(6))
  ).current;

  useEffect(() => {
    if (playing) {
      const animations = anims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 4 + Math.random() * 16, duration: 300 + i * 80, useNativeDriver: false }),
            Animated.timing(anim, { toValue: 4, duration: 300 + i * 80, useNativeDriver: false }),
          ])
        )
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    } else {
      anims.forEach((anim) => Animated.timing(anim, { toValue: 6, duration: 200, useNativeDriver: false }).start());
    }
  }, [playing]);

  return (
    <View style={styles.row}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={[styles.bar, { backgroundColor: color, height: anim }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 20 },
  bar: { width: 3, borderRadius: 2, minHeight: 4 },
});
