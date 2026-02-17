import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLibraryStore } from '../../store/libraryStore';
import { ProgressBar } from '../ui/ProgressBar';
import { BookCover } from '../ui/BookCover';
import { EighteenPlus } from '../../icons';
import type { Book } from '../../types/book';

interface Props {
  book: Book;
  liked: boolean;
  onPress: () => void;
}

export function StoryCard({ book, liked, onPress }: Props) {
  const t = useTheme();
  const rated = useLibraryStore((s) => s.ratedBookIds.includes(book.id));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}
    >
      <BookCover thumbnailUrl={book.thumbnailUrl} title={book.title} size={{ width: 70, height: 90 }} />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
            {book.title}
          </Text>
          {book.is_adult && <EighteenPlus size={32} />}
        </View>
        <Text style={[styles.author, { color: t.textSecondary }]}>{book.author}</Text>
        <View style={styles.metaRow}>
          {!!book.genre && <Text style={[styles.meta, { color: t.textMuted }]}>{book.genre}</Text>}
          {!!book.genre && !!book.duration && <Text style={[styles.meta, { color: t.textMuted }]}> · </Text>}
          {!!book.duration && <Text style={[styles.meta, { color: t.textMuted }]}>{book.duration}</Text>}
        </View>
        <View style={styles.bottomRow}>
          {!!book.listeners && book.listeners !== '0' && (
            <View style={styles.statItem}>
              <Feather name="headphones" size={14} color={book.progress > 0 ? t.primary : t.textMuted} />
              <Text style={[styles.statCount, { color: book.progress > 0 ? t.primary : t.textMuted }]}>{book.listeners}</Text>
            </View>
          )}
          {book.rating > 0 && (
            <View style={styles.statItem}>
              <Feather name="star" size={14} color={rated ? t.primary : t.textMuted} />
              <Text style={[styles.statCount, { color: rated ? t.primary : t.textMuted }]}>{book.rating.toFixed(1)}</Text>
            </View>
          )}
          {(!!book.likes && book.likes !== '0') && (
            <View style={styles.statItem}>
              <Feather name="heart" size={14} color={liked ? t.primary : t.textMuted} />
              <Text style={[styles.statCount, { color: liked ? t.primary : t.textMuted }]}>{book.likes}</Text>
            </View>
          )}
        </View>
        {book.progress > 0 && (
          <View style={styles.progressWrap}>
            <ProgressBar progress={book.progress} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  info: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '600', flex: 1 },
  author: { fontSize: 12, fontStyle: 'italic', marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { fontSize: 11 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statCount: { fontSize: 10 },
  progressWrap: { marginTop: 8 },
});
