import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

interface Props {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export function StarRating({ rating, size = 14, showValue = true }: Props) {
  const t = useTheme();
  const full = Math.floor(rating);
  const partial = rating - full;

  return (
    <View style={styles.row}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={{ width: size, height: size, marginRight: 2 }}>
          {/* Base star (inactive) */}
          <Svg width={size} height={size} viewBox="0 0 24 24" style={StyleSheet.absoluteFill}>
            <Path d={STAR_PATH} fill={t.starInactive} />
          </Svg>
          {/* Full star */}
          {i < full && (
            <Svg width={size} height={size} viewBox="0 0 24 24" style={StyleSheet.absoluteFill}>
              <Path d={STAR_PATH} fill={t.starActive} />
            </Svg>
          )}
          {/* Partial star */}
          {i === full && partial > 0 && (
            <Svg width={size} height={size} viewBox="0 0 24 24" style={StyleSheet.absoluteFill}>
              <Defs>
                <ClipPath id={`clip-${rating}`}>
                  <Rect x="0" y="0" width={partial * 24} height="24" />
                </ClipPath>
              </Defs>
              <Path d={STAR_PATH} fill={t.starActive} clipPath={`url(#clip-${rating})`} />
            </Svg>
          )}
        </View>
      ))}
      {showValue && <Text style={[styles.value, { color: t.textSecondary }]}>{rating}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  value: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
});
