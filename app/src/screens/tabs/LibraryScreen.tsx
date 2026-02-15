import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBookStore } from '../../store/bookStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAuthStore } from '../../store/authStore';
import { useLockStore } from '../../store/lockStore';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StarRating } from '../../components/ui/StarRating';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookCover } from '../../components/ui/BookCover';
import type { MainStackParamList } from '../../types/navigation';
import type { Book } from '../../types/book';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type TabId = 'listening' | 'liked';

export function LibraryScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { isAdult } = useAuthStore();
  const { isUnlocked } = useLockStore();
  const books = useBookStore((s) => s.books);
  const { likedBookIds, toggleLike } = useLibraryStore();

  const [activeTab, setActiveTab] = useState<TabId>('listening');

  const progress = useLibraryStore((s) => s.listeningProgress);

  // Use all books (no category/search filter) — Library shows everything the user has interacted with
  const allVisible = books.filter((b) => !b.is_adult || (isAdult && isUnlocked));

  // Merge progress from libraryStore into books
  const booksWithProgress = allVisible.map((b) => {
    const p = progress[b.id];
    return p ? { ...b, progress: p.percent, currentChapter: p.chapterIndex + 1 } : b;
  });

  const continueListening = booksWithProgress.filter((b) => b.progress > 0);
  const likedBooks = booksWithProgress.filter((b) => likedBookIds.includes(b.id));

  const tabs: { id: TabId; label: string; icon: string; count: number }[] = [
    { id: 'listening', label: 'Listening', icon: 'headphones', count: continueListening.length },
    { id: 'liked', label: 'Liked', icon: 'heart', count: likedBooks.length },
  ];

  const openDetail = (book: Book) => nav.navigate('StoryDetail', { book });

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.bg }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: t.text }]}>My Library</Text>

      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return isActive ? (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.tabBtnOuter}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={t.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabBtn}
              >
                <Feather name={tab.icon as any} size={14} color="#fff" />
                <Text style={styles.tabTextActive}>{tab.label}</Text>
                <View style={styles.countBadgeActive}>
                  <Text style={styles.countTextActive}>{tab.count}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabBtnOuter, styles.tabBtn]}
              activeOpacity={0.7}
            >
              <Feather name={tab.icon as any} size={14} color={t.textSecondary} />
              <Text style={[styles.tabText, { color: t.textSecondary }]}>{tab.label}</Text>
              <View style={[styles.countBadge, { backgroundColor: t.primarySoft }]}>
                <Text style={[styles.countText, { color: t.primary }]}>{tab.count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Listening Tab */}
      {activeTab === 'listening' && (
        <View>
          {continueListening.map((book) => (
            <TouchableOpacity
              key={book.id}
              onPress={() => openDetail(book)}
              style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}
              activeOpacity={0.7}
            >
              <BookCover thumbnailUrl={book.thumbnailUrl} title={book.title} size={{ width: 56, height: 56 }} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: t.text }]} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleLike(book.id)}
                    hitSlop={8}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="heart"
                      size={16}
                      color={likedBookIds.includes(book.id) ? '#FF4444' : t.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cardAuthor, { color: t.textSecondary }]}>{book.author}</Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.cardProgress, { color: t.primary }]}>
                    {Math.round(book.progress * 100)}% complete
                  </Text>
                  <Text style={[styles.cardChapter, { color: t.textMuted }]}>
                    Ch. {book.currentChapter}/{book.chapters}
                  </Text>
                </View>
                <ProgressBar progress={book.progress} height={3} />
              </View>
            </TouchableOpacity>
          ))}
          {continueListening.length === 0 && (
            <EmptyState
              icon="headphones"
              title="Nothing playing"
              subtitle="Start listening to add stories here"
            />
          )}
        </View>
      )}

      {/* Liked Tab */}
      {activeTab === 'liked' && (
        <View>
          {likedBooks.map((book) => (
            <TouchableOpacity
              key={book.id}
              onPress={() => openDetail(book)}
              style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}
              activeOpacity={0.7}
            >
              <BookCover thumbnailUrl={book.thumbnailUrl} title={book.title} size={{ width: 56, height: 70 }} />
              <View style={styles.likedBody}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: t.text }]} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleLike(book.id)}
                    hitSlop={8}
                    activeOpacity={0.7}
                  >
                    <Feather name="heart" size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cardAuthor, { color: t.textSecondary }]}>{book.author}</Text>
                <View style={styles.likedMeta}>
                  {!!book.genre && <Text style={[styles.metaItem, { color: t.textMuted }]}>{book.genre}</Text>}
                  {!!book.genre && !!book.duration && <Text style={[styles.metaDot, { color: t.textMuted }]}>&bull;</Text>}
                  {!!book.duration && <Text style={[styles.metaItem, { color: t.textMuted }]}>{book.duration}</Text>}
                  {(!!book.genre || !!book.duration) && book.rating > 0 && <Text style={[styles.metaDot, { color: t.textMuted }]}>&bull;</Text>}
                  {book.rating > 0 && <StarRating rating={book.rating} count={book.ratingCount} size={12} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {likedBooks.length === 0 && (
            <EmptyState
              icon="heart"
              title="No liked stories yet"
              subtitle="Tap the heart on any story to save it"
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 160 },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  tabBtnOuter: { flex: 1 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },
  tabText: { fontSize: 13, fontWeight: '700' },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countTextActive: { fontSize: 10, fontWeight: '800', color: '#fff' },
  countBadge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 10 },
  countText: { fontSize: 10, fontWeight: '800' },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardBody: { flex: 1 },
  likedBody: { flex: 1, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  cardAuthor: { fontSize: 12, marginTop: 2 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 6,
  },
  cardProgress: { fontSize: 11, fontWeight: '600' },
  cardChapter: { fontSize: 11 },
  likedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaItem: { fontSize: 11 },
  metaDot: { fontSize: 11 },
});
