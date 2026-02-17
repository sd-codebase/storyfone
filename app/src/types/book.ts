export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  genreNames: string[];
  thumbnailUrl: string | null;
  is_adult: boolean;
  chapters: number;
  description?: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  duration: string;
  listeners: string;
  likes: string;
  progress: number;
  currentChapter: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  duration: number; // seconds
  audioUrl?: string;
}

export interface Genre {
  id: string;
  name: string;
  icon: string;
  is_adult: boolean;
}
