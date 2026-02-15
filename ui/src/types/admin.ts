// --- Admin entity types ---

export interface Language {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Genre {
  id: string;
  name: string;
  icon: string;
  is_adult: boolean;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Narrator {
  id: string;
  name: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export const UserPlan = {
  MAX: 'Max',
  PRO: 'Pro',
} as const;
export type UserPlan = (typeof UserPlan)[keyof typeof UserPlan];

export const UserStatus = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DELETED: 'deleted',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface AppUser {
  id: string;
  name: string;
  whatsapp_number: string;
  country_code: string;
  is_verified: boolean;
  birthdate: string | null;
  plan: UserPlan;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface GenerateOtpResponse {
  otp: string;
  whatsapp_number: string;
  whatsapp_url: string;
}

export const AudioStatus = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  ERROR: 'error',
} as const;
export type AudioStatus = (typeof AudioStatus)[keyof typeof AudioStatus];

export interface Book {
  id: string;
  title: string;
  authors: string[];
  narrators: string[];
  language: string | null;
  genres: string[];
  description: string;
  is_published: boolean;
  is_adult: boolean;
  thumbnail_url: string | null;
  preview_audio_raw: string | null;
  preview_audio_hls: string | null;
  audio_status: AudioStatus;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  book_id: string;
  status: AudioStatus;
  is_published: boolean;
  thumbnail_url: string | null;
  audio_raw: string | null;
  audio_hls: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  user_name: string;
  book_id: string;
  book_title: string;
  reason: string;
  created_at: string;
}

export interface TrendingList {
  language: string;
  language_name: string;
  book_ids_sfw: string[];
  book_ids_adult: string[];
  updated_at: string;
}

export interface EditorPick {
  language: string;
  language_name: string;
  book_id_sfw: string;
  book_id_adult: string | null;
  updated_at: string;
}
