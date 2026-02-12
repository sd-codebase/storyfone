import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  const t = useTheme();
  return (
    <View style={styles.container}>
      <Feather name={icon} size={48} color={t.textMuted} style={styles.icon} />
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 50 },
  icon: { marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 13 },
});
