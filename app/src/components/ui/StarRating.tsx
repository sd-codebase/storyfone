import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface Props {
  rating: number;
  count?: number;
  size?: number;
}

export function StarRating({ rating, count, size = 14 }: Props) {
  const t = useTheme();

  return (
    <View style={styles.row}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={STAR_PATH} fill={t.starActive} />
      </Svg>
      <Text style={[styles.value, { color: t.textSecondary, fontSize: size - 2 }]}>
        {rating.toFixed(1)}
      </Text>
      {count != null && count > 0 && (
        <Text style={[styles.count, { color: t.textMuted, fontSize: size - 3 }]}>
          ({formatCount(count)})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  value: { fontWeight: '700' },
  count: { fontWeight: '400' },
});
