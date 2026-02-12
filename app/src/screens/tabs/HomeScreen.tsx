import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, StyleSheet, ActivityIndicator, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useLockStore } from '../../store/lockStore';
import { useBookStore } from '../../store/bookStore';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { useThemeStore } from '../../store/themeStore';
import { StoryfoneLogo } from '../../icons';
import { StoryCard } from '../../components/story/StoryCard';
import { StoryCardCompact } from '../../components/story/StoryCardCompact';
import { TrendingCard } from '../../components/story/TrendingCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Tag } from '../../components/ui/Tag';
import { IconButton } from '../../components/ui/IconButton';
import { EmptyState } from '../../components/ui/EmptyState';
import type { MainStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function HomeScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { isAdult, user } = useAuthStore();
  const { isUnlocked, lock } = useLockStore();
  const { searchQuery, selectedCategory, setSearchQuery, setCategory, getVisibleBooks, getVisibleCategories, fetchBooks, fetchTrending, fetchMoreBooks, trendingBooks, isLoading, hasMore, searchBooks, searchResults, isSearching } = useBookStore();
  const { likedBookIds, toggleLike } = useLibraryStore();
  const progress = useLibraryStore((s) => s.listeningProgress);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const currentPlayingBookId = usePlayerStore((s) => s.currentBook?.id);
  const books = useBookStore((s) => s.books);

  const languages = user?.preferredLanguages?.join(',');

  useEffect(() => {
    fetchBooks(languages);
    fetchTrending(languages);
  }, [languages]);

  // Debounced server-side search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchQuery.trim()) {
      searchTimer.current = setTimeout(() => {
        searchBooks(searchQuery.trim(), languages);
      }, 400);
    }
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery, languages]);

  const visibleBooks = getVisibleBooks(isAdult, isUnlocked);
  const categories = getVisibleCategories(isAdult, isUnlocked);

  // Merge progress from libraryStore into books
  const booksWithProgress = visibleBooks.map((b) => {
    const p = progress[b.id];
    return p ? { ...b, progress: p.percent, currentChapter: p.chapterIndex + 1 } : b;
  });

  // Compute continue listening and category-filtered independently of selectedCategory
  const allBooksWithProgress = books
    .filter((b) => !(b.is_adult && (!isAdult || !isUnlocked)))
    .map((b) => {
      const p = progress[b.id];
      return p ? { ...b, progress: p.percent, currentChapter: p.chapterIndex + 1 } : b;
    });

  const continueListening = allBooksWithProgress.filter((b) => b.progress > 0 && b.id !== currentPlayingBookId);

  // Use server-managed trending (independent of genre)
  const trending = trendingBooks.length > 0
    ? trendingBooks.filter((b) => !(b.is_adult && (!isAdult || !isUnlocked)))
    : allBooksWithProgress.slice(0, 5);

  // When searching, use server results (with adult filter + progress merge); otherwise category-filtered
  const searchBooksWithProgress = searchResults
    .filter((b) => !(b.is_adult && (!isAdult || !isUnlocked)))
    .map((b) => {
      const p = progress[b.id];
      return p ? { ...b, progress: p.percent, currentChapter: p.chapterIndex + 1 } : b;
    });

  const filteredBooks = searchQuery.trim()
    ? searchBooksWithProgress
    : booksWithProgress.filter((b) => {
        if (selectedCategory !== 'All' && !b.genreNames.includes(selectedCategory)) return false;
        return true;
      });

  const categoryListRef = useRef<FlatList>(null);

  // Auto-scroll category list when selectedCategory changes
  useEffect(() => {
    const idx = categories.indexOf(selectedCategory);
    if (idx > 0 && categoryListRef.current) {
      categoryListRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    }
  }, [selectedCategory, categories]);

  const [scrolled, setScrolled] = useState(false);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    setScrolled(contentOffset.y > 2);
    // Auto-fetch next page when near bottom
    if (contentSize.height - contentOffset.y - layoutMeasurement.height < 300) {
      const { isLoading: loading, hasMore: more } = useBookStore.getState();
      if (!loading && more && !searchQuery) {
        fetchMoreBooks(languages);
      }
    }
  }, [languages, searchQuery]);

  const openDetail = (book: any) => nav.navigate('StoryDetail', { book });

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, { backgroundColor: t.bg, paddingTop: insets.top }, scrolled && styles.stickyHeaderShadow]}>
        <View style={styles.header}>
          <View>
            <StoryfoneLogo width={180} theme={t} />
            <Text style={[styles.greeting, { color: t.textSecondary }]}>Good evening, listener</Text>
          </View>
          <View style={styles.headerActions}>
            {isAdult && (
              <IconButton
                name={isUnlocked ? 'unlock' : 'lock'}
                onPress={() => isUnlocked ? lock() : nav.navigate('LockScreen')}
                bgColor={t.bgCard}
                borderColor={t.border}
                color={isUnlocked ? t.primary : t.textMuted}
              />
            )}
            <IconButton
              name={t.mode === 'dark' ? 'sun' : 'moon'}
              onPress={toggleTheme}
              bgColor={t.bgCard}
              borderColor={t.border}
            />
          </View>
        </View>
      </View>

      {isLoading && books.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : (
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 160 }} onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: t.bgInput, borderColor: t.borderSubtle }]}>
        <Feather name="search" size={16} color={t.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search stories, authors..."
          placeholderTextColor={t.textMuted}
          style={[styles.searchInput, { color: t.text }]}
        />
      </View>

      {/* Continue Listening */}
      {!searchQuery && continueListening.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Continue Listening" style={styles.sectionTitle} />
          <FlatList
            horizontal
            data={continueListening}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <StoryCardCompact book={item} onPress={() => openDetail(item)} />}
            contentContainerStyle={styles.hList}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          />
        </View>
      )}

      {/* Trending */}
      {!searchQuery && trending.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Trending Now" style={styles.sectionTitle} />
          <FlatList
            horizontal
            data={trending}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <TrendingCard book={item} rank={index + 1} onPress={() => openDetail(item)} />}
            contentContainerStyle={styles.hList}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          />
        </View>
      )}

      {/* Categories */}
      <FlatList
        ref={categoryListRef}
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Tag label={item} active={selectedCategory === item} onPress={() => setCategory(item)} />}
        contentContainerStyle={[styles.hList, { marginBottom: 14 }]}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            categoryListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
          }, 200);
        }}
      />

      {/* Story List */}
      <View style={styles.storyList}>
        <SectionHeader title={searchQuery ? 'Search Results' : selectedCategory === 'All' ? 'All Stories' : selectedCategory} />
        {isSearching && (
          <ActivityIndicator color={t.primary} style={{ marginVertical: 20 }} />
        )}
        {!isSearching && filteredBooks.map((book) => (
          <StoryCard
            key={book.id}
            book={book}
            liked={likedBookIds.includes(book.id)}
            onPress={() => openDetail(book)}
            onLikePress={() => toggleLike(book.id)}
          />
        ))}
        {!isSearching && filteredBooks.length === 0 && <EmptyState icon="search" title="No stories found" subtitle="Try a different search or category" />}
        {isLoading && books.length > 0 && (
          <ActivityIndicator color={t.primary} style={styles.loadingMore} />
        )}
      </View>
    </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyHeader: { zIndex: 10 },
  stickyHeaderShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  scroll: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  headerActions: { flexDirection: 'row', gap: 8 },
  greeting: { fontSize: 13, marginTop: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16 },
  searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 14 },
  section: { marginBottom: 28 },
  sectionTitle: { paddingHorizontal: 20 },
  hList: { paddingHorizontal: 20 },
  storyList: { paddingHorizontal: 20 },
  loadingMore: { paddingVertical: 20 },
});
