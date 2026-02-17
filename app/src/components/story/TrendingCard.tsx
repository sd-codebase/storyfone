import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BookCover } from '../ui/BookCover';
import { EighteenPlus } from '../../icons';
import type { Book } from '../../types/book';

interface Props {
  book: Book;
  rank: number;
  onPress: () => void;
}

export function TrendingCard({ book, rank, onPress }: Props) {
  const t = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={[styles.cover, { borderColor: t.borderSubtle }]}>
        <BookCover thumbnailUrl={book.thumbnailUrl} title={book.title} size={{ width: 130, height: 170 }} borderRadius={16} fontSize={48} />
        <View style={[styles.rankBadge, { backgroundColor: t.primary }]}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
        {book.is_adult && (
          <View style={styles.adultBadge}>
            <EighteenPlus size={32} />
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{book.title}</Text>
      <View style={styles.statsRow}>
        {!!book.listeners && (
          <View style={styles.statItem}>
            <Feather name="headphones" size={12} color={t.textMuted} />
            <Text style={[styles.statCount, { color: t.textMuted }]}>{book.listeners}</Text>
          </View>
        )}
        {book.rating > 0 && (
          <View style={styles.statItem}>
            <Feather name="star" size={12} color={t.textMuted} />
            <Text style={[styles.statCount, { color: t.textMuted }]}>{book.rating.toFixed(1)}</Text>
          </View>
        )}
        {!!book.likes && (
          <View style={styles.statItem}>
            <Feather name="heart" size={12} color={t.textMuted} />
            <Text style={[styles.statCount, { color: t.textMuted }]}>{book.likes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 130, alignItems: 'center' },
  cover: { width: 130, height: 170, borderRadius: 16, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  rankBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  rankText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  title: { fontSize: 12, fontWeight: '600', marginTop: 8, maxWidth: 130 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 6 },
  statItem: { alignItems: 'center', gap: 2 },
  statCount: { fontSize: 9 },
  adultBadge: { position: 'absolute', top: 8, right: 8 },
});
