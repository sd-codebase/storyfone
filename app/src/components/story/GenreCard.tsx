import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { GENRE_ICONS } from '../../icons';
import type { Genre } from '../../types/book';

interface Props {
  genre: Genre;
  onPress: () => void;
}

export function GenreCard({ genre, onPress }: Props) {
  const t = useTheme();
  const IconComponent = GENRE_ICONS[genre.name];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}
    >
      {IconComponent ? (
        <IconComponent size={40} />
      ) : (
        <Feather name={genre.icon as any} size={28} color={t.primary} />
      )}
      <Text style={[styles.name, { color: t.text }]}>{genre.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  name: { fontSize: 13, fontWeight: '600', marginTop: 8 },
});
