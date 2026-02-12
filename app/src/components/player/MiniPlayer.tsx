import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { usePlayerStore } from '../../store/playerStore';
import { BookCover } from '../ui/BookCover';
import { ProgressBar } from '../ui/ProgressBar';
import type { MainStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function MiniPlayer() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const { currentBook, isPlaying, togglePlayPause, currentTime, duration } = usePlayerStore();

  if (!currentBook) return null;

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <TouchableOpacity
      onPress={() => nav.navigate('FullPlayer')}
      activeOpacity={0.9}
      style={[styles.container, { backgroundColor: t.bgElevated, borderColor: t.borderSubtle }]}
    >
      <ProgressBar progress={progress} height={2} style={styles.progressBar} />
      <View style={styles.content}>
        <BookCover
          thumbnailUrl={currentBook.thumbnailUrl}
          title={currentBook.title}
          size={{ width: 40, height: 40 }}
          borderRadius={8}
        />
        <View style={styles.info}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
            {currentBook.title}
          </Text>
          <Text style={[styles.author, { color: t.textMuted }]} numberOfLines={1}>
            {currentBook.author}
          </Text>
        </View>
        <TouchableOpacity onPress={togglePlayPause} activeOpacity={0.7} style={styles.playBtn}>
          <LinearGradient
            colors={t.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playGradient}
          >
            <Feather name={isPlaying ? 'pause' : 'play'} size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  progressBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600' },
  author: { fontSize: 11, marginTop: 1 },
  playBtn: {},
  playGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
