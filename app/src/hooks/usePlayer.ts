import { usePlayerStore } from '../store/playerStore';

export function usePlayer() {
  const store = usePlayerStore();

  return {
    ...store,
    isActive: store.currentBook !== null,
    progress: store.duration > 0 ? store.currentTime / store.duration : 0,
    chapterLabel: store.currentBook
      ? `Chapter ${store.currentChapterIndex + 1} of ${store.currentBook.chapters}`
      : '',
  };
}
