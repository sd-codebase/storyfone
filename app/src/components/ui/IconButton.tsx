import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  name: React.ComponentProps<typeof Feather>['name'];
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
  bgColor?: string;
  borderColor?: string;
}

export function IconButton({ name, size = 20, color, onPress, style, bgColor, borderColor }: Props) {
  const t = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, { backgroundColor: bgColor || t.bgCard, borderColor: borderColor || t.border }, style]}
      activeOpacity={0.7}
    >
      <Feather name={name} size={size} color={color || t.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
