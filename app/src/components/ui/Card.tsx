import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
});
