export const API_BASE = 'https://east-best-washington-steady.trycloudflare.com';

export const ENDPOINTS = {
  auth: {
    register: '/api/v1/app/auth/register',
    login: '/api/v1/app/auth/login',
    languages: '/api/v1/app/auth/languages',
  },
  user: {
    me: '/api/v1/app/users/me',
    pin: '/api/v1/app/users/me/pin',
    pinVerify: '/api/v1/app/users/me/pin/verify',
    pinExists: '/api/v1/app/users/me/pin/exists',
    stats: '/api/v1/app/users/me/stats',
    listenTime: '/api/v1/app/users/me/listen-time',
    deleteAccount: '/api/v1/app/users/me',
    changeWhatsapp: '/api/v1/app/users/me/change-whatsapp',
    verifyWhatsapp: '/api/v1/app/users/me/verify-whatsapp',
  },
  books: {
    list: '/api/v1/app/books',
    detail: (id: string) => `/api/v1/app/books/${id}`,
    chapters: (id: string) => `/api/v1/app/books/${id}/chapters`,
    listen: (id: string) => `/api/v1/app/books/${id}/listen`,
    rate: (id: string) => `/api/v1/app/books/${id}/rate`,
    rating: (id: string) => `/api/v1/app/books/${id}/rating`,
    report: (id: string) => `/api/v1/app/books/${id}/report`,
  },
  genres: {
    list: '/api/v1/app/genres',
  },
  trending: '/api/v1/app/trending',
  editorPick: '/api/v1/app/editor-pick',
  library: {
    like: (bookId: string) => `/api/v1/app/library/like/${bookId}`,
    liked: '/api/v1/app/library/liked',
    progress: (bookId: string) => `/api/v1/app/library/progress/${bookId}`,
    allProgress: '/api/v1/app/library/progress',
  },
  audio: {
    stream: (id: string) => `/audio/stream/${id}`,
  },
} as const;

export const LEGAL_URLS = {
  termsOfService: process.env.EXPO_PUBLIC_TERMS_URL || 'https://storyfone.com/terms',
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || 'https://storyfone.com/privacy',
  helpAndSupport: process.env.EXPO_PUBLIC_SUPPORT_URL || 'https://storyfone.com/support',
} as const;
