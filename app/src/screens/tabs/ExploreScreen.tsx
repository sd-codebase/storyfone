import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useLockStore } from '../../store/lockStore';
import { useBookStore } from '../../store/bookStore';
import { EditorPickBanner } from '../../components/story/EditorPickBanner';
import { GenreCard } from '../../components/story/GenreCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import type { MainStackParamList, TabParamList } from '../../types/navigation';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Explore'>,
  NativeStackNavigationProp<MainStackParamList>
>;

export function ExploreScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { isAdult, user } = useAuthStore();
  const { isUnlocked } = useLockStore();
  const { editorPick, getVisibleGenres, setCategory, fetchEditorPick, fetchBooks } = useBookStore();

  const languages = user?.preferredLanguages?.join(',');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEditorPick(languages, isAdult && isUnlocked);
  }, [languages, isAdult, isUnlocked]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchBooks(languages),
      fetchEditorPick(languages, isAdult && isUnlocked),
    ]);
    setRefreshing(false);
  }, [languages, isAdult, isUnlocked]);

  const visibleGenres = getVisibleGenres(isAdult, isUnlocked);
  const featuredBook = editorPick;

  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <FlatList
        data={visibleGenres}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.genreRow}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
        ListHeaderComponent={
          <>
            <Text style={[styles.title, { color: t.text }]}>Explore</Text>
            <Text style={[styles.subtitle, { color: t.textSecondary }]}>Discover your next obsession</Text>
            {featuredBook && (
              <EditorPickBanner book={featuredBook} onPress={() => nav.navigate('StoryDetail', { book: featuredBook })} />
            )}
            <SectionHeader title="Browse by Genre" />
          </>
        }
        renderItem={({ item }) => (
          <GenreCard
            genre={item}
            onPress={() => {
              setCategory(item.name);
              nav.navigate('Home');
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 20 },
  genreRow: { gap: 12 },
});
