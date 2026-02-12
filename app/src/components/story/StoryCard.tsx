import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StarRating } from '../ui/StarRating';
import { ProgressBar } from '../ui/ProgressBar';
import { BookCover } from '../ui/BookCover';
import { EighteenPlus } from '../../icons';
import type { Book } from '../../types/book';

interface Props {
  book: Book;
  liked: boolean;
  onPress: () => void;
  onLikePress: () => void;
}

export function StoryCard({ book, liked, onPress, onLikePress }: Props) {
  const t = useTheme();

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
          {book.is_adult && <EighteenPlus size={22} color={t.tag18} />}
        </View>
        <Text style={[styles.author, { color: t.textSecondary }]}>{book.author}</Text>
        <View style={styles.metaRow}>
          {!!book.genre && <Text style={[styles.meta, { color: t.textMuted }]}>{book.genre}</Text>}
          {!!book.genre && !!book.duration && <Text style={[styles.meta, { color: t.textMuted }]}> · </Text>}
          {!!book.duration && <Text style={[styles.meta, { color: t.textMuted }]}>{book.duration}</Text>}
        </View>
        <View style={styles.bottomRow}>
          {book.rating > 0 ? <StarRating rating={book.rating} count={book.ratingCount} /> : <View />}
          <View style={styles.actions}>
            {!!book.listeners && <Text style={[styles.listeners, { color: t.textMuted }]}>{book.listeners}</Text>}
            <TouchableOpacity onPress={onLikePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="heart" size={16} color={liked ? t.primary : t.textMuted} fill={liked ? t.primary : 'none'} />
            </TouchableOpacity>
          </View>
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
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listeners: { fontSize: 11 },
  progressWrap: { marginTop: 8 },
});
