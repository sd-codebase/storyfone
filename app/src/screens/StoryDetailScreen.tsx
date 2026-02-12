import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { StarRating } from '../components/ui/StarRating';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GradientButton } from '../components/ui/GradientButton';
import { BookCover } from '../components/ui/BookCover';
import { getChapters, reportBook } from '../api/books';
import type { ApiChapterOut } from '../api/books';
import type { MainStackParamList } from '../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Route = RouteProp<MainStackParamList, 'StoryDetail'>;

export function StoryDetailScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const rawBook = route.params.book;
  const { likedBookIds, toggleLike } = useLibraryStore();
  const progress = useLibraryStore((s) => s.listeningProgress);
  const loadBook = usePlayerStore((s) => s.loadBook);

  // Merge listening progress from libraryStore
  const p = progress[rawBook.id];
  const book = p ? { ...rawBook, progress: p.percent, currentChapter: p.chapterIndex + 1 } : rawBook;
  const isLiked = likedBookIds.includes(book.id);

  const [chapters, setChapters] = useState<ApiChapterOut[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingChapters(true);
    getChapters(book.id)
      .then((data) => {
        if (!cancelled) setChapters(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingChapters(false);
      });
    return () => { cancelled = true; };
  }, [book.id]);

  const handlePlay = () => {
    loadBook(book, chapters, book.currentChapter > 0 ? book.currentChapter - 1 : 0);
    nav.navigate('FullPlayer');
  };

  const hasMetaRow = book.rating > 0 || !!book.listeners || !!book.duration;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Hero Cover */}
      <View style={styles.hero}>
        <BookCover
          thumbnailUrl={book.thumbnailUrl}
          title={book.title}
          size={{ width: SCREEN_WIDTH, height: 300 }}
          borderRadius={0}
          fontSize={80}
        />
        <View style={styles.heroOverlay} />

        {/* Back button */}
        <TouchableOpacity
          onPress={() => nav.goBack()}
          style={[styles.headerBtn, { top: insets.top + 8, left: 20 }]}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Like button */}
        <TouchableOpacity
          onPress={() => toggleLike(book.id)}
          style={[styles.headerBtn, { top: insets.top + 8, right: book.is_adult ? 64 : 20 }]}
          activeOpacity={0.7}
        >
          <Feather name="heart" size={18} color={isLiked ? '#FF4444' : '#fff'} />
        </TouchableOpacity>

        {/* 18+ badge */}
        {book.is_adult && (
          <View style={[styles.matureBadge, { top: insets.top + 14 }]}>
            <Text style={styles.matureText}>18+</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Author */}
        <Text style={[styles.title, { color: t.text }]}>{book.title}</Text>
        <Text style={[styles.author, { color: t.textSecondary }]}>by {book.author}</Text>

        {/* Meta row */}
        {hasMetaRow && (
          <View style={styles.metaRow}>
            {book.rating > 0 && <StarRating rating={book.rating} />}
            {book.rating > 0 && !!book.listeners && <Text style={[styles.metaDot, { color: t.textMuted }]}>&bull;</Text>}
            {!!book.listeners && <Text style={[styles.metaText, { color: t.textSecondary }]}>{book.listeners} listeners</Text>}
            {!!book.listeners && !!book.duration && <Text style={[styles.metaDot, { color: t.textMuted }]}>&bull;</Text>}
            {!!book.duration && <Text style={[styles.metaText, { color: t.textSecondary }]}>{book.duration}</Text>}
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagRow}>
          {!!book.genre && (
            <View style={[styles.genreTag, { backgroundColor: t.primarySoft }]}>
              <Text style={[styles.genreTagText, { color: t.primary }]}>{book.genre}</Text>
            </View>
          )}
          <View style={[styles.genreTag, { backgroundColor: t.borderSubtle }]}>
            <Text style={[styles.chapterTagText, { color: t.textMuted }]}>{book.chapters} chapters</Text>
          </View>
        </View>

        {/* Progress (if started) */}
        {book.progress > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressMeta}>
              <Text style={[styles.progressText, { color: t.textSecondary }]}>
                Chapter {book.currentChapter} of {book.chapters}
              </Text>
              <Text style={[styles.progressPercent, { color: t.primary }]}>
                {Math.round(book.progress * 100)}%
              </Text>
            </View>
            <ProgressBar progress={book.progress} height={4} />
          </View>
        )}

        {/* Description */}
        {!!book.description && (
          <Text style={[styles.description, { color: t.textSecondary }]}>
            {book.description}
          </Text>
        )}

        {/* Chapters */}
        <Text style={[styles.sectionTitle, { color: t.text }]}>CHAPTERS</Text>
        {loadingChapters ? (
          <ActivityIndicator color={t.primary} style={{ marginVertical: 20 }} />
        ) : chapters.length === 0 ? (
          <Text style={[styles.noChapters, { color: t.textMuted }]}>No chapters available</Text>
        ) : (
          chapters.map((ch, i) => (
            <View
              key={ch.id}
              style={[styles.chapterRow, { borderBottomColor: t.borderSubtle }]}
            >
              <View
                style={[
                  styles.chapterNumber,
                  {
                    backgroundColor:
                      i < book.currentChapter ? t.primarySoft : t.bgSecondary,
                  },
                ]}
              >
                {i < book.currentChapter ? (
                  <Feather name="check" size={14} color={t.primary} />
                ) : (
                  <Text style={[styles.chapterNumText, { color: t.textMuted }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterTitle, { color: t.text }]}>
                  {ch.name}
                </Text>
              </View>
              {i < book.currentChapter && (
                <Text style={[styles.playedLabel, { color: t.primary }]}>Played</Text>
              )}
            </View>
          ))
        )}

        {/* Report */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Report this book?', 'Select a reason', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Inappropriate content', onPress: () => reportBook(book.id, 'inappropriate').catch(() => {}) },
              { text: 'Copyright issue', onPress: () => reportBook(book.id, 'copyright').catch(() => {}) },
              { text: 'Other', onPress: () => reportBook(book.id, 'other').catch(() => {}) },
            ]);
          }}
          style={styles.reportBtn}
          activeOpacity={0.7}
        >
          <Feather name="flag" size={14} color={t.textMuted} />
          <Text style={[styles.reportText, { color: t.textMuted }]}>Report</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Play Button */}
      <LinearGradient
        colors={['transparent', t.bg]}
        style={styles.bottomGradient}
        pointerEvents="box-none"
      >
        <GradientButton
          title={book.progress > 0 ? '  Continue Listening' : '  Start Listening'}
          onPress={handlePlay}
          disabled={loadingChapters || chapters.length === 0}
          style={styles.playBtn}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    height: 300,
    position: 'relative',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  headerBtn: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  matureBadge: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  matureText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingTop: 28, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  author: { fontSize: 14, fontStyle: 'italic', marginTop: 8 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  metaDot: { fontSize: 12 },
  metaText: { fontSize: 12 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  genreTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  genreTagText: { fontSize: 11, fontWeight: '600' },
  chapterTagText: { fontSize: 11 },
  progressSection: { marginTop: 20 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12 },
  progressPercent: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 24, marginTop: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 28,
    marginBottom: 12,
  },
  noChapters: { fontSize: 13, textAlign: 'center', marginVertical: 20 },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumText: { fontSize: 12, fontWeight: '600' },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontSize: 14, fontWeight: '500' },
  playedLabel: { fontSize: 11, fontWeight: '600' },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  playBtn: { width: '100%' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 24, paddingVertical: 8 },
  reportText: { fontSize: 12 },
});
