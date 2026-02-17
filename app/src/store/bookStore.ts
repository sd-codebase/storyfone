import { create } from 'zustand';
import type { Book, Genre } from '../types/book';
import * as booksApi from '../api/books';
import type { ApiBookOut, ApiGenreOut } from '../api/books';

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  if (n > 0) return String(n);
  return '';
}

function mapApiBook(b: ApiBookOut, genreMap: Record<string, string>): Book {
  const genreNames = b.genres
    .map((gid) => genreMap[gid] || gid)
    .filter(Boolean);
  return {
    id: b.id,
    title: b.title,
    author: b.authors.join(', ') || 'Unknown',
    genre: genreNames[0] || '',
    genreNames,
    thumbnailUrl: b.thumbnail_url,
    rating: b.average_rating,
    ratingCount: b.rating_count,
    duration: '',
    progress: 0,
    listeners: formatCount(b.listen_count),
    likes: formatCount(b.likes_count),
    is_adult: b.is_adult,
    chapters: b.chapter_count,
    currentChapter: 0,
    description: b.description,
    tags: b.tags || [],
  };
}

function mapApiGenre(g: ApiGenreOut): Genre {
  return { id: g.id, name: g.name, icon: g.icon, is_adult: g.is_adult };
}

interface BookStore {
  books: Book[];
  genres: Genre[];
  allCategories: string[];
  selectedCategory: string;
  searchQuery: string;
  isLoading: boolean;
  trendingBooks: Book[];
  editorPick: Book | null;
  page: number;
  hasMore: boolean;
  total: number;
  searchResults: Book[];
  isSearching: boolean;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  searchBooks: (query: string, languages?: string) => Promise<void>;
  fetchBooks: (languages?: string) => Promise<void>;
  fetchMoreBooks: (languages?: string) => Promise<void>;
  fetchTrending: (languages?: string) => Promise<void>;
  fetchEditorPick: (languages?: string, includeAdult?: boolean) => Promise<void>;
  getVisibleBooks: (isAdult: boolean, isUnlocked: boolean) => Book[];
  getVisibleGenres: (isAdult: boolean, isUnlocked: boolean) => Genre[];
  getVisibleCategories: (isAdult: boolean, isUnlocked: boolean) => string[];
}

const PAGE_SIZE = 20;

export const useBookStore = create<BookStore>()((set, get) => ({
  books: [],
  genres: [],
  allCategories: ['All'],
  selectedCategory: 'All',
  searchQuery: '',
  isLoading: false,
  trendingBooks: [],
  editorPick: null,
  page: 0,
  hasMore: true,
  total: 0,
  searchResults: [],
  isSearching: false,
  setCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query, ...(query ? { selectedCategory: 'All' } : {}) }),
  searchBooks: async (query, languages) => {
    set({ isSearching: true });
    try {
      const { genres } = get();
      const genreMap: Record<string, string> = {};
      for (const g of genres) genreMap[g.id] = g.name;
      const res = await booksApi.listBooks({ search: query, languages, limit: 50 });
      set({ searchResults: res.books.map((b) => mapApiBook(b, genreMap)), isSearching: false });
    } catch {
      set({ isSearching: false });
    }
  },
  fetchBooks: async (languages) => {
    set({ isLoading: true, page: 0, hasMore: true });
    try {
      const [booksRes, genresRes] = await Promise.all([
        booksApi.listBooks({ languages, limit: PAGE_SIZE, skip: 0 }),
        booksApi.listGenres(),
      ]);
      const genres = genresRes.map(mapApiGenre);
      const genreMap: Record<string, string> = {};
      for (const g of genres) {
        genreMap[g.id] = g.name;
      }
      const books = booksRes.books.map((b) => mapApiBook(b, genreMap));
      const cats = ['All', ...genres.map((g) => g.name)];
      set({
        books,
        genres,
        allCategories: cats,
        isLoading: false,
        total: booksRes.total,
        hasMore: books.length < booksRes.total,
        page: 1,
      });
    } catch (e) {
      console.error('Failed to fetch books:', e);
      set({ isLoading: false });
    }
  },
  fetchMoreBooks: async (languages) => {
    const { isLoading, hasMore, page, books, genres } = get();
    if (isLoading || !hasMore) return;
    set({ isLoading: true });
    try {
      const genreMap: Record<string, string> = {};
      for (const g of genres) genreMap[g.id] = g.name;
      const res = await booksApi.listBooks({ languages, limit: PAGE_SIZE, skip: page * PAGE_SIZE });
      const newBooks = res.books.map((b) => mapApiBook(b, genreMap));
      const existingIds = new Set(books.map((b) => b.id));
      const deduped = newBooks.filter((b) => !existingIds.has(b.id));
      set({
        books: [...books, ...deduped],
        isLoading: false,
        hasMore: books.length + deduped.length < res.total,
        page: page + 1,
      });
    } catch {
      set({ isLoading: false });
    }
  },
  fetchTrending: async (languages) => {
    try {
      const data = await booksApi.getTrendingBooks(languages);
      const { genres } = get();
      const genreMap: Record<string, string> = {};
      for (const g of genres) genreMap[g.id] = g.name;
      set({ trendingBooks: data.map((b) => mapApiBook(b, genreMap)) });
    } catch {
      // keep existing
    }
  },
  fetchEditorPick: async (languages, includeAdult) => {
    try {
      const data = await booksApi.getEditorPick(languages, includeAdult);
      if (data) {
        const { genres } = get();
        const genreMap: Record<string, string> = {};
        for (const g of genres) genreMap[g.id] = g.name;
        set({ editorPick: mapApiBook(data, genreMap) });
      } else {
        set({ editorPick: null });
      }
    } catch {
      // keep existing
    }
  },
  getVisibleBooks: (isAdult, isUnlocked) => {
    const { books, selectedCategory, searchQuery } = get();
    return books.filter((book) => {
      if (book.is_adult && (!isAdult || !isUnlocked)) return false;
      if (selectedCategory !== 'All' && !book.genreNames.includes(selectedCategory)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!book.title.toLowerCase().includes(q) && !book.author.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },
  getVisibleGenres: (isAdult, isUnlocked) => {
    const { genres } = get();
    return genres.filter((g) => !g.is_adult || (isAdult && isUnlocked));
  },
  getVisibleCategories: (isAdult, isUnlocked) => {
    const { allCategories, genres } = get();
    const visibleGenreNames = new Set(
      genres.filter((g) => !g.is_adult || (isAdult && isUnlocked)).map((g) => g.name)
    );
    return allCategories.filter((c) => c === 'All' || visibleGenreNames.has(c));
  },
}));
