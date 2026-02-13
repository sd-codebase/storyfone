import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  secure?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function PinInput({ value, onChange, secure = true, error, autoFocus = true }: Props) {
  const t = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const backspaceRef = useRef(false);

  const handleChange = (text: string, index: number) => {
    // Skip if backspace already handled it
    if (!text && backspaceRef.current) {
      backspaceRef.current = false;
      return;
    }
    if (!/^\d?$/.test(text)) return;
    const newValue = [...value];
    newValue[index] = text;
    onChange(newValue);
    if (text && index < value.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      backspaceRef.current = true;
      if (value[index]) {
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
        if (index > 0) inputs.current[index - 1]?.focus();
      } else if (index > 0) {
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const isCompact = value.length > 4;
  const cellWidth = isCompact ? 46 : 58;
  const cellGap = isCompact ? 10 : 14;

  return (
    <Animated.View style={[styles.row, { gap: cellGap, transform: [{ translateX: shakeAnim }] }]}>
      {value.map((digit, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputs.current[i] = ref; }}
          value={digit}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          secureTextEntry={secure && !!digit}
          autoFocus={autoFocus && i === 0}
          caretHidden
          selectionColor="transparent"
          style={[
            styles.input,
            {
              width: cellWidth,
              borderColor: digit ? t.primary : t.borderSubtle,
              backgroundColor: digit ? t.primarySoft : t.bgInput,
              color: t.text,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  input: {
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
});
