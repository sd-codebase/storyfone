import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  current: number;
  total?: number;
}

export function StepDots({ current, total = 2 }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: current === i ? 24 : 8,
              backgroundColor: i <= current ? t.primary : t.primarySoft,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 28 },
  dot: { height: 8, borderRadius: 4 },
});
