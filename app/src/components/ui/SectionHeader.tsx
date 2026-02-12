import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title: string;
  style?: ViewStyle;
}

export function SectionHeader({ title, style }: Props) {
  const t = useTheme();
  return <Text style={[styles.title, { color: t.text }, style]}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 },
});
