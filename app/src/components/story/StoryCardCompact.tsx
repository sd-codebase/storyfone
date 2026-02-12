import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { ProgressBar } from '../ui/ProgressBar';
import { BookCover } from '../ui/BookCover';
import { EighteenPlus } from '../../icons';
import type { Book } from '../../types/book';

interface Props {
  book: Book;
  onPress: () => void;
}

export function StoryCardCompact({ book, onPress }: Props) {
  const t = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}>
      <View style={styles.coverArea}>
        <BookCover thumbnailUrl={book.thumbnailUrl} title={book.title} size={{ width: '100%', height: 100 }} borderRadius={0} />
        <View style={styles.playBadge}>
          <Feather name="play" size={10} color="#fff" />
        </View>
        {book.is_adult && (
          <View style={styles.adultBadge}>
            <EighteenPlus size={20} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{book.title}</Text>
        <Text style={[styles.chapter, { color: t.textMuted }]}>Ch. {book.currentChapter}/{book.chapters}</Text>
        <ProgressBar progress={book.progress} height={3} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  coverArea: { height: 100, position: 'relative' },
  playBadge: { position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  adultBadge: { position: 'absolute', top: 6, right: 6 },
  info: { padding: 12 },
  title: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  chapter: { fontSize: 11, marginBottom: 8 },
});
