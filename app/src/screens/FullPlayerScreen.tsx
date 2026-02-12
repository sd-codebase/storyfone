import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { AudioWave } from '../components/ui/AudioWave';
import { BookCover } from '../components/ui/BookCover';
import { EighteenPlus } from '../icons';
import { formatTime } from '../utils/formatTime';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS: { value: null | 15 | 30 | 45 | 60 | 'chapter'; label: string }[] = [
  { value: null, label: 'Off' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 'chapter', label: 'End of chapter' },
];

export function FullPlayerScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const {
    currentBook,
    currentChapterIndex,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    sleepTimer,
    togglePlayPause,
    seekBy,
    nextChapter,
    prevChapter,
    setSpeed,
    setSleepTimer,
    seekTo,
  } = usePlayerStore();
  const { likedBookIds, toggleLike } = useLibraryStore();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  const chapterDuration = duration || 1;
  const progress = chapterDuration > 0 ? currentTime / chapterDuration : 0;
  const isLiked = currentBook ? likedBookIds.includes(currentBook.id) : false;

  const handleProgressPress = useCallback(
    (e: any) => {
      const x = e.nativeEvent.locationX;
      const barWidth = SCREEN_WIDTH - 64;
      const ratio = Math.max(0, Math.min(1, x / barWidth));
      seekTo(Math.round(ratio * chapterDuration));
    },
    [chapterDuration, seekTo]
  );

  if (!currentBook) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <Text style={[styles.emptyText, { color: t.textMuted }]}>No audio loaded</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Ambient glow */}
      <View style={[styles.ambientGlow, { backgroundColor: t.primaryGlow }]} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => nav.goBack()} activeOpacity={0.7} style={styles.topBtn}>
          <Feather name="chevron-down" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.nowPlaying, { color: t.textMuted }]}>NOW PLAYING</Text>
        <View style={styles.topBtn} />
      </View>

      {/* Cover Art */}
      <View style={styles.coverContainer}>
        <View style={styles.coverArt}>
          <BookCover
            thumbnailUrl={currentBook.thumbnailUrl}
            title={currentBook.title}
            size={{ width: 220, height: 220 }}
            borderRadius={28}
            fontSize={90}
          />
        </View>
      </View>

      {/* Title, Author, Chapter */}
      <View style={styles.infoSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithBadge}>
              <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
                {currentBook.title}
              </Text>
              {currentBook.is_adult && <EighteenPlus size={20} color={t.textMuted} />}
            </View>
            <Text style={[styles.author, { color: t.textSecondary }]}>{currentBook.author}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleLike(currentBook.id)}
            activeOpacity={0.7}
            style={styles.likeBtn}
          >
            <Feather name="heart" size={22} color={isLiked ? '#FF4444' : t.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.chapterLabel, { color: t.primary }]}>
          Chapter {currentChapterIndex + 1} of {currentBook.chapters}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <TouchableOpacity
          onPress={handleProgressPress}
          activeOpacity={1}
          style={[styles.progressTrack, { backgroundColor: t.progressBg }]}
        >
          <LinearGradient
            colors={t.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
          {/* Scrubber */}
          <View
            style={[
              styles.scrubber,
              {
                left: `${progress * 100}%`,
                backgroundColor: t.primary,
                borderColor: t.text,
              },
            ]}
          />
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: t.textMuted }]}>{formatTime(currentTime)}</Text>
          <Text style={[styles.timeText, { color: t.textMuted }]}>
            -{formatTime(chapterDuration - currentTime)}
          </Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={() => seekBy(-10)} activeOpacity={0.7} style={styles.controlBtn}>
          <Feather name="rotate-ccw" size={26} color={t.textSecondary} />
          <Text style={[styles.seekLabel, { color: t.textSecondary }]}>10</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={prevChapter} activeOpacity={0.7} style={styles.controlBtn}>
          <Feather name="skip-back" size={24} color={t.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlayPause} activeOpacity={0.8}>
          <LinearGradient
            colors={t.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playButton}
          >
            <Feather name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextChapter} activeOpacity={0.7} style={styles.controlBtn}>
          <Feather name="skip-forward" size={24} color={t.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => seekBy(10)} activeOpacity={0.7} style={styles.controlBtn}>
          <Feather name="rotate-cw" size={26} color={t.textSecondary} />
          <Text style={[styles.seekLabel, { color: t.textSecondary }]}>10</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryRow}>
        {/* Speed */}
        <TouchableOpacity
          onPress={() => { setShowSpeedMenu(true); setShowSleepMenu(false); }}
          style={[styles.secondaryBtn, showSpeedMenu && { backgroundColor: t.primarySoft, borderColor: t.border, borderWidth: 1 }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.speedText, { color: showSpeedMenu ? t.primary : t.textSecondary }]}>
            {playbackSpeed}x
          </Text>
          <Text style={[styles.secondaryLabel, { color: t.textMuted }]}>Speed</Text>
        </TouchableOpacity>

        {/* Sleep Timer */}
        <TouchableOpacity
          onPress={() => { setShowSleepMenu(true); setShowSpeedMenu(false); }}
          style={[styles.secondaryBtn, (showSleepMenu || sleepTimer) && { backgroundColor: t.primarySoft, borderColor: t.border, borderWidth: 1 }]}
          activeOpacity={0.7}
        >
          <Feather name="moon" size={16} color={sleepTimer ? t.primary : t.textSecondary} />
          <Text style={[styles.secondaryLabel, { color: sleepTimer ? t.primary : t.textMuted }]}>
            {sleepTimer ? (sleepTimer === 'chapter' ? 'Ch.' : `${sleepTimer}m`) : 'Sleep'}
          </Text>
        </TouchableOpacity>

        {/* Download */}
        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
          <Feather name="download" size={16} color={t.textSecondary} />
          <Text style={[styles.secondaryLabel, { color: t.textMuted }]}>Download</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
          <Feather name="share" size={16} color={t.textSecondary} />
          <Text style={[styles.secondaryLabel, { color: t.textMuted }]}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Audio Visualizer */}
      <View style={styles.visualizerRow}>
        <AudioWave color={t.primary} playing={isPlaying} barCount={28} />
      </View>

      {/* Chapter Info Strip */}
      <View style={[styles.chapterStrip, { backgroundColor: t.bgCard, borderColor: t.borderSubtle }]}>
        <View style={styles.chapterStripLeft}>
          <Feather name="book-open" size={14} color={t.text} />
          <View>
            <Text style={[styles.chapterStripTitle, { color: t.text }]}>
              Chapter {currentChapterIndex + 1}
            </Text>
            <Text style={[styles.chapterStripSub, { color: t.textMuted }]}>
              {currentBook.chapters} chapters total
            </Text>
          </View>
        </View>
        <View style={styles.chapterStripRight}>
          <Text style={[styles.speedBadge, { color: t.textSecondary }]}>{playbackSpeed}x</Text>
          {sleepTimer && (
            <View style={[styles.chipBadge, { backgroundColor: t.primarySoft }]}>
              <Text style={[styles.chipText, { color: t.primary }]}>
                {sleepTimer === 'chapter' ? 'Ch.' : `${sleepTimer}m`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Speed Menu Modal */}
      <Modal visible={showSpeedMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={() => setShowSpeedMenu(false)}
          activeOpacity={1}
        >
          <View style={[styles.menuCard, { backgroundColor: t.bgElevated, borderColor: t.border }]}>
            <Text style={[styles.menuTitle, { color: t.text }]}>Playback Speed</Text>
            {SPEEDS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => { setSpeed(s); setShowSpeedMenu(false); }}
                style={[
                  styles.menuItem,
                  playbackSpeed === s && { backgroundColor: t.primarySoft },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    { color: playbackSpeed === s ? t.primary : t.text },
                    playbackSpeed === s && { fontWeight: '700' },
                  ]}
                >
                  {s}x {s === 1 ? '(Normal)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Timer Menu Modal */}
      <Modal visible={showSleepMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={() => setShowSleepMenu(false)}
          activeOpacity={1}
        >
          <View style={[styles.menuCard, { backgroundColor: t.bgElevated, borderColor: t.border }]}>
            <Text style={[styles.menuTitle, { color: t.text }]}>Sleep Timer</Text>
            {SLEEP_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                onPress={() => { setSleepTimer(opt.value); setShowSleepMenu(false); }}
                style={[
                  styles.menuItem,
                  sleepTimer === opt.value && { backgroundColor: t.primarySoft },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    { color: sleepTimer === opt.value ? t.primary : t.text },
                    sleepTimer === opt.value && { fontWeight: '700' },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 100 },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    opacity: 0.4,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  topBtn: { padding: 4 },
  nowPlaying: { fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  coverContainer: { alignItems: 'center', paddingVertical: 24, zIndex: 1 },
  coverArt: {
    width: 220,
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
  },
  infoSection: { paddingHorizontal: 32, zIndex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titleContainer: { flex: 1 },
  titleWithBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28, flexShrink: 1 },
  author: { fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  likeBtn: { marginTop: 4, padding: 4 },
  chapterLabel: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  progressSection: { paddingHorizontal: 32, marginTop: 20, zIndex: 1 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  scrubber: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginLeft: -7,
    zIndex: 3,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { fontSize: 11, fontVariant: ['tabular-nums'] },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
    marginTop: 16,
    zIndex: 1,
  },
  controlBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  seekLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '800',
    top: 18,
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginTop: 20,
    zIndex: 1,
  },
  secondaryBtn: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  speedText: { fontSize: 14, fontWeight: '800' },
  secondaryLabel: { fontSize: 9, fontWeight: '600' },
  visualizerRow: {
    alignItems: 'center',
    marginTop: 16,
    zIndex: 1,
  },
  chapterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 32,
    marginTop: 20,
    marginBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  chapterStripLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chapterStripTitle: { fontSize: 12, fontWeight: '600' },
  chapterStripSub: { fontSize: 11 },
  chapterStripRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  chipText: { fontSize: 10, fontWeight: '700' },
  speedBadge: { fontSize: 11, fontWeight: '600' },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    width: 260,
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: { fontSize: 14 },
});
