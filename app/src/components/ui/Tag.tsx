import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Tag({ label, active, onPress }: Props) {
  const t = useTheme();

  if (active) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient colors={t.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tag}>
          <Text style={styles.activeText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tag, { backgroundColor: t.bgCard, borderColor: t.borderSubtle, borderWidth: 1 }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: t.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  text: { fontSize: 12, fontWeight: '600' },
  activeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
});
