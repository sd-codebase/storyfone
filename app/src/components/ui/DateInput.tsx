import React, { useRef } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  day: string;
  month: string;
  year: string;
  onDayChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
}

export function DateInput({ day, month, year, onDayChange, onMonthChange, onYearChange }: Props) {
  const t = useTheme();
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const inputStyle = [styles.input, { backgroundColor: t.bgInput, borderColor: t.borderSubtle, color: t.text }];

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: t.textMuted }]}>DAY</Text>
        <TextInput
          value={day}
          onChangeText={(v) => {
            const clean = v.replace(/\D/g, '');
            onDayChange(clean);
            if (clean.length === 2) monthRef.current?.focus();
          }}
          placeholder="DD"
          placeholderTextColor={t.textMuted}
          keyboardType="number-pad"
          maxLength={2}
          caretHidden
          style={inputStyle}
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: t.textMuted }]}>MONTH</Text>
        <TextInput
          ref={monthRef}
          value={month}
          onChangeText={(v) => {
            const clean = v.replace(/\D/g, '');
            onMonthChange(clean);
            if (clean.length === 2) yearRef.current?.focus();
          }}
          placeholder="MM"
          placeholderTextColor={t.textMuted}
          keyboardType="number-pad"
          maxLength={2}
          caretHidden
          style={inputStyle}
        />
      </View>
      <View style={[styles.field, { flex: 1.4 }]}>
        <Text style={[styles.label, { color: t.textMuted }]}>YEAR</Text>
        <TextInput
          ref={yearRef}
          value={year}
          onChangeText={(v) => onYearChange(v.replace(/\D/g, ''))}
          placeholder="YYYY"
          placeholderTextColor={t.textMuted}
          keyboardType="number-pad"
          maxLength={4}
          caretHidden
          style={inputStyle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: 2 },
});
