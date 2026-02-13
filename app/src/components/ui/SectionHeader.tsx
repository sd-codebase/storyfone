import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  customIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({ title, icon, customIcon, style }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.row, style]}>
      {customIcon ? (
        <View style={styles.icon}>{customIcon}</View>
      ) : icon ? (
        <Feather name={icon} size={16} color={t.primary} style={styles.icon} />
      ) : null}
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  icon: { marginRight: 8 },
  title: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
});
