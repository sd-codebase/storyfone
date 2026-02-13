import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useDownloadStore } from '../store/downloadStore';
import { useBookStore } from '../store/bookStore';
import { BookCover } from '../components/ui/BookCover';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import type { MainStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function DownloadsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const downloads = useDownloadStore((s) => s.downloads);
  const removeDownload = useDownloadStore((s) => s.removeDownload);
  const books = useBookStore((s) => s.books);

  const downloadEntries = Object.values(downloads);

  const handleDelete = (bookId: string, title: string) => {
    Alert.alert('Remove Download', `Remove "${title}" from downloads?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeDownload(bookId) },
    ]);
  };

  const getStatusColor = (status: string) => {
    if (status === 'done') return '#22C55E';
    if (status === 'downloading') return t.primary;
    return '#FF4444';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'done') return 'Downloaded';
    if (status === 'downloading') return 'Downloading...';
    return 'Error';
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.bg }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={12} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: t.text }]}>Downloads</Text>
        <View style={{ width: 24 }} />
      </View>

      {downloadEntries.length === 0 ? (
        <EmptyState
          icon="download"
          title="No downloads yet"
          subtitle="Download stories to listen offline"
        />
      ) : (
        downloadEntries.map((dl) => {
          const book = books.find((b) => b.id === dl.bookId);
          const title = book?.title || 'Unknown';
          const author = book?.author || '';

          return (
            <TouchableOpacity
              key={dl.bookId}
              onPress={() => {
                if (book) nav.navigate('StoryDetail', { book });
              }}
              style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}
              activeOpacity={0.7}
            >
              <BookCover
                thumbnailUrl={book?.thumbnailUrl ?? null}
                title={title}
                size={{ width: 56, height: 56 }}
              />
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: t.text }]} numberOfLines={1}>
                  {title}
                </Text>
                {!!author && (
                  <Text style={[styles.cardAuthor, { color: t.textSecondary }]}>{author}</Text>
                )}
                <View style={styles.cardMeta}>
                  <Text style={[styles.chapterCount, { color: t.textMuted }]}>
                    {dl.chapters.length}/{dl.totalChapters} chapters
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dl.status) + '1A' }]}>
                    <Feather
                      name={dl.status === 'done' ? 'check' : dl.status === 'downloading' ? 'download' : 'alert-circle'}
                      size={10}
                      color={getStatusColor(dl.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(dl.status) }]}>
                      {getStatusLabel(dl.status)}
                    </Text>
                  </View>
                </View>
                {dl.status === 'downloading' && (
                  <View style={styles.progressRow}>
                    <ProgressBar progress={dl.progress} height={3} />
                    <Text style={[styles.progressText, { color: t.primary }]}>
                      {Math.round(dl.progress * 100)}%
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(dl.bookId, title)}
                hitSlop={8}
                activeOpacity={0.7}
                style={styles.deleteBtn}
              >
                <Feather name="trash-2" size={18} color={t.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 160 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heading: { fontSize: 20, fontWeight: '800' },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardAuthor: { fontSize: 12, marginTop: 2 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chapterCount: { fontSize: 11 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  progressText: { fontSize: 11, fontWeight: '600', width: 32 },
  deleteBtn: { padding: 4 },
});
