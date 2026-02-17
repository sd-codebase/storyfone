import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BookCover } from '../ui/BookCover';
import { EighteenPlus } from '../../icons';
import type { Book } from '../../types/book';

interface Props {
  book: Book;
  onPress: () => void;
}

export function EditorPickBanner({ book, onPress }: Props) {
  const t = useTheme();
  const hasStats = book.rating > 0 || !!book.listeners || !!book.likes;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={t.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.labelRow}>
          <Text style={styles.label}>EDITOR'S PICK</Text>
          {book.is_adult && <EighteenPlus size={28} />}
        </View>
        <View style={styles.content}>
          <BookCover thumbnailUrl={book.thumbnailUrl} title={book.title} size={{ width: 70, height: 90 }} fontSize={36} />
          <View style={styles.info}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>by {book.author}</Text>
            {hasStats && (
              <View style={styles.statsRow}>
                {!!book.listeners && (
                  <View style={styles.statItem}>
                    <Feather name="headphones" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statCount}>{book.listeners}</Text>
                  </View>
                )}
                {book.rating > 0 && (
                  <View style={styles.statItem}>
                    <Feather name="star" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statCount}>{book.rating.toFixed(1)}</Text>
                  </View>
                )}
                {!!book.likes && (
                  <View style={styles.statItem}>
                    <Feather name="heart" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statCount}>{book.likes}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 20, padding: 24, marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  info: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  author: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  statItem: { alignItems: 'center', gap: 2 },
  statCount: { fontSize: 10, color: 'rgba(255,255,255,0.9)' },
});
