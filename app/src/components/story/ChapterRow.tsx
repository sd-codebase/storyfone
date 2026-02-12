import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  number: number;
  isPlayed: boolean;
  totalChapters: number;
}

export function ChapterRow({ number, isPlayed }: Props) {
  const t = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: t.borderSubtle }]}>
      <View style={[styles.numberBox, { backgroundColor: isPlayed ? t.primarySoft : t.bgSecondary }]}>
        {isPlayed ? (
          <Feather name="check" size={12} color={t.primary} />
        ) : (
          <Text style={[styles.number, { color: t.textMuted }]}>{number}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: t.text }]}>Chapter {number}</Text>
        <Text style={[styles.duration, { color: t.textMuted }]}>~12 min</Text>
      </View>
      {isPlayed && <Text style={[styles.played, { color: t.primary }]}>Played</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  numberBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 12, fontWeight: '600' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '500' },
  duration: { fontSize: 12, marginTop: 2 },
  played: { fontSize: 11, fontWeight: '600' },
});
