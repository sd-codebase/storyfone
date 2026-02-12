import api from './client';
import { ENDPOINTS } from '../constants/api';

export interface ApiBookOut {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  description: string;
  is_adult: boolean;
  language: string | null;
  tags: string[];
  thumbnail_url: string | null;
  chapter_count: number;
  listen_count: number;
  average_rating: number;
  rating_count: number;
  created_at: string;
}

export interface ApiChapterOut {
  id: string;
  name: string;
  book_id: string;
  audio_hls: string | null;
  order: number;
  created_at: string;
}

export interface ApiGenreOut {
  id: string;
  name: string;
  icon: string;
  is_adult: boolean;
}

export async function listBooks(params?: {
  category?: string;
  search?: string;
  is_adult?: boolean;
  languages?: string;
  skip?: number;
  limit?: number;
}) {
  const { data } = await api.get<{ books: ApiBookOut[]; total: number }>(ENDPOINTS.books.list, { params });
  return data;
}

export async function getBook(id: string) {
  const { data } = await api.get<ApiBookOut>(ENDPOINTS.books.detail(id));
  return data;
}

export async function getChapters(bookId: string) {
  const { data } = await api.get<ApiChapterOut[]>(ENDPOINTS.books.chapters(bookId));
  return data;
}

export async function listGenres() {
  const { data } = await api.get<ApiGenreOut[]>(ENDPOINTS.genres.list);
  return data;
}

export async function getTrendingBooks(languages?: string) {
  const { data } = await api.get<ApiBookOut[]>(ENDPOINTS.trending, { params: languages ? { languages } : undefined });
  return data;
}

export async function getEditorPick(languages?: string, includeAdult?: boolean) {
  const { data } = await api.get<ApiBookOut | null>(ENDPOINTS.editorPick, {
    params: { languages, include_adult: includeAdult },
  });
  return data;
}

export async function recordListen(bookId: string) {
  await api.post(ENDPOINTS.books.listen(bookId));
}

export async function rateBook(bookId: string, rating: number) {
  const { data } = await api.post<{ user_rating: number; average: number; count: number }>(
    ENDPOINTS.books.rate(bookId),
    { rating },
  );
  return data;
}

export async function getBookRating(bookId: string) {
  const { data } = await api.get<{ user_rating: number | null; average: number; count: number }>(
    ENDPOINTS.books.rating(bookId),
  );
  return data;
}

export async function reportBook(bookId: string, reason: string) {
  await api.post(ENDPOINTS.books.report(bookId), { reason });
}
