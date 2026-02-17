import api from './client';
import { ENDPOINTS } from '../constants/api';

export async function toggleLike(bookId: string) {
  const { data } = await api.post<{ liked: boolean; likes_count: number }>(ENDPOINTS.library.like(bookId));
  return data;
}

export async function getLikedBooks() {
  const { data } = await api.get<{ book_ids: string[] }>(ENDPOINTS.library.liked);
  return data.book_ids;
}

export async function saveProgress(
  bookId: string,
  body: { chapter_index: number; position: number; percent: number },
) {
  await api.post(ENDPOINTS.library.progress(bookId), body);
}

export interface ProgressEntry {
  book_id: string;
  chapter_index: number;
  position: number;
  percent: number;
  last_played: string;
}

export async function getAllProgress() {
  const { data } = await api.get<{ progress: ProgressEntry[] }>(ENDPOINTS.library.allProgress);
  return data.progress;
}
