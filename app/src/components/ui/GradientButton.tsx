import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GradientButton({ title, onPress, disabled, style, textStyle }: Props) {
  const t = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} style={[styles.wrapper, style]}>
      <LinearGradient
        colors={disabled ? [t.bgCard, t.bgCard] : t.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, { opacity: disabled ? 0.4 : 1 }, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 14, overflow: 'hidden' },
  gradient: { paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
