import axios from 'axios';
import type {
  ProcessDialogueRequest,
  ProcessDialogueResponse,
  AudioFileInfo,
  AudioSearchResult,
  ProjectInfo,
  ProjectFull,
  MixSceneResponse,
  MixChapterResponse,
} from '../types/api';
import type {
  Language,
  Genre,
  Author,
  Narrator,
  AppUser,
  GenerateOtpResponse,
  Book,
  Chapter,
} from '../types/admin';
import type { SceneElement } from '../types/script';
import { ElementType } from '../types/script';

export const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

const AUTH_TOKEN_KEY = 'auth_token';

export const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and reload to show login screen
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Dialogue TTS ---

async function mockProcessDialogue(
  req: ProcessDialogueRequest,
): Promise<ProcessDialogueResponse> {
  await delay(1000 + Math.random() * 2000);

  // Simulate occasional errors
  if (Math.random() < 0.1) {
    return {
      dialogueId: req.dialogueId,
      status: 'error',
      error: 'Mock: TTS engine timeout',
    };
  }

  return {
    dialogueId: req.dialogueId,
    status: 'completed',
    audioUrl: `https://mock-audio.example.com/${req.dialogueId}.wav`,
  };
}

export async function processDialogue(
  req: ProcessDialogueRequest,
): Promise<ProcessDialogueResponse> {
  if (MOCK_API) {
    return mockProcessDialogue(req);
  }

  const { data } = await client.post<ProcessDialogueResponse>(
    '/api/v1/dialogue/process',
    req,
  );
  return data;
}

// --- Audio Library ---

export async function uploadAudio(
  file: File,
  category: 'sfx' | 'bgm',
  description: string,
  tags: string,
): Promise<AudioFileInfo> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  form.append('description', description);
  form.append('tags', tags);

  const { data } = await client.post<AudioFileInfo>('/api/v1/audio/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function searchAudio(
  query: string,
  category?: 'sfx' | 'bgm',
): Promise<AudioSearchResult> {
  const params: Record<string, string> = { q: query };
  if (category) params.category = category;
  const { data } = await client.get<AudioSearchResult>('/api/v1/audio/search', { params });
  return data;
}

export async function listAudio(category?: 'sfx' | 'bgm'): Promise<AudioFileInfo[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  const { data } = await client.get<AudioFileInfo[]>('/api/v1/audio', { params });
  return data;
}

export async function deleteAudio(id: string): Promise<void> {
  await client.delete(`/api/v1/audio/${id}`);
}

export function getAudioFileUrl(id: string): string {
  return `${API_BASE}/api/v1/audio/${id}/file`;
}

export function getTtsAudioUrl(dialogueId: string): string {
  return `${API_BASE}/api/v1/dialogue/tts/${dialogueId}`;
}

// --- Projects ---

export async function saveProject(name: string, chapterJson: string): Promise<ProjectFull> {
  const { data } = await client.post<ProjectFull>('/api/v1/projects', {
    name,
    chapter_json: chapterJson,
  });
  return data;
}

export async function listProjects(): Promise<ProjectInfo[]> {
  const { data } = await client.get<ProjectInfo[]>('/api/v1/projects');
  return data;
}

export async function loadProject(id: string): Promise<ProjectFull> {
  const { data } = await client.get<ProjectFull>(`/api/v1/projects/${id}`);
  return data;
}

export async function updateProject(
  id: string,
  updates: { name?: string; chapter_json?: string },
): Promise<ProjectFull> {
  const { data } = await client.put<ProjectFull>(`/api/v1/projects/${id}`, updates);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await client.delete(`/api/v1/projects/${id}`);
}

// --- Scene Mix ---

function elementToPayload(el: SceneElement) {
  const base = { id: el.id, type: el.type, order: el.order };
  switch (el.type) {
    case ElementType.DIALOGUE:
      return {
        ...base,
        characterName: el.characterName,
        dialogueText: el.dialogueText,
        audioUrl: el.audioUrl,
      };
    case ElementType.SFX:
    case ElementType.BGM:
      return {
        ...base,
        description: el.description,
        timing: el.timing,
        audioFileId: el.audioFileId,
      };
    case ElementType.PAUSE:
      return { ...base, duration: el.duration };
    default:
      return base;
  }
}

export async function mixScene(
  sceneId: string,
  elements: SceneElement[],
): Promise<MixSceneResponse> {
  const { data } = await client.post<MixSceneResponse>('/api/v1/mix', {
    sceneId,
    elements: elements.map(elementToPayload),
  });
  return data;
}

export function getMixAudioUrl(sceneId: string): string {
  return `${API_BASE}/api/v1/mix/${sceneId}`;
}

// --- Chapter Mix ---

export async function mixChapter(
  chapterId: string,
  scenes: { sceneId: string; elements: SceneElement[] }[],
): Promise<MixChapterResponse> {
  const { data } = await client.post<MixChapterResponse>('/api/v1/mix/chapter', {
    chapterId,
    scenes: scenes.map((s) => ({
      sceneId: s.sceneId,
      elements: s.elements.map(elementToPayload),
    })),
  });
  return data;
}

export function getChapterMixAudioUrl(chapterId: string): string {
  return `${API_BASE}/api/v1/mix/chapter/${chapterId}`;
}

// --- Auth ---

export async function login(
  username: string,
  password: string,
): Promise<{ access_token: string; token_type: string }> {
  const { data } = await client.post<{ access_token: string; token_type: string }>(
    '/api/v1/auth/login',
    { username, password },
  );
  return data;
}

// --- Admin CRUD ---

function adminCrud<T extends { id: string }>(basePath: string) {
  return {
    list: async (): Promise<T[]> => {
      const { data } = await client.get<T[]>(basePath);
      return data;
    },
    get: async (id: string): Promise<T> => {
      const { data } = await client.get<T>(`${basePath}/${id}`);
      return data;
    },
    create: async (body: Record<string, unknown>): Promise<T> => {
      const { data } = await client.post<T>(basePath, body);
      return data;
    },
    update: async (id: string, body: Record<string, unknown>): Promise<T> => {
      const { data } = await client.put<T>(`${basePath}/${id}`, body);
      return data;
    },
    remove: async (id: string): Promise<void> => {
      await client.delete(`${basePath}/${id}`);
    },
  };
}

export const languagesApi = adminCrud<Language>('/api/v1/admin/languages');
export const genresApi = adminCrud<Genre>('/api/v1/admin/genres');
export const authorsApi = adminCrud<Author>('/api/v1/admin/authors');
export const narratorsApi = adminCrud<Narrator>('/api/v1/admin/narrators');
export const usersApi = adminCrud<AppUser>('/api/v1/admin/users');

export async function generateOtp(userId: string): Promise<GenerateOtpResponse> {
  const { data } = await client.post<GenerateOtpResponse>(
    `/api/v1/admin/users/${userId}/generate-otp`,
  );
  return data;
}

// --- Books ---

function buildFormData(fields: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined || val === null) continue;
    fd.append(key, Array.isArray(val) ? JSON.stringify(val) : String(val));
  }
  return fd;
}

export const booksApi = {
  list: async (): Promise<Book[]> => {
    const { data } = await client.get<Book[]>('/api/v1/admin/books');
    return data;
  },
  get: async (id: string): Promise<Book> => {
    const { data } = await client.get<Book>(`/api/v1/admin/books/${id}`);
    return data;
  },
  create: async (fields: Record<string, unknown>): Promise<Book> => {
    const fd = buildFormData(fields);
    const { data } = await client.post<Book>('/api/v1/admin/books', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  update: async (id: string, fields: Record<string, unknown>): Promise<Book> => {
    const fd = buildFormData(fields);
    const { data } = await client.put<Book>(`/api/v1/admin/books/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/api/v1/admin/books/${id}`);
  },
  processAudio: async (id: string): Promise<Book> => {
    const { data } = await client.post<Book>(
      `/api/v1/admin/books/${id}/process-audio`,
    );
    return data;
  },
  publish: async (id: string): Promise<Book> => {
    const { data } = await client.put<Book>(
      `/api/v1/admin/books/${id}/publish`,
    );
    return data;
  },
  unpublish: async (id: string): Promise<Book> => {
    const { data } = await client.put<Book>(
      `/api/v1/admin/books/${id}/unpublish`,
    );
    return data;
  },
};

// --- Chapters ---

export const chaptersApi = {
  list: async (bookId: string): Promise<Chapter[]> => {
    const { data } = await client.get<Chapter[]>(
      `/api/v1/admin/books/${bookId}/chapters`,
    );
    return data;
  },
  get: async (bookId: string, id: string): Promise<Chapter> => {
    const { data } = await client.get<Chapter>(
      `/api/v1/admin/books/${bookId}/chapters/${id}`,
    );
    return data;
  },
  create: async (bookId: string, fields: Record<string, unknown>): Promise<Chapter> => {
    const fd = buildFormData(fields);
    const { data } = await client.post<Chapter>(
      `/api/v1/admin/books/${bookId}/chapters`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
  update: async (bookId: string, id: string, fields: Record<string, unknown>): Promise<Chapter> => {
    const fd = buildFormData(fields);
    const { data } = await client.put<Chapter>(
      `/api/v1/admin/books/${bookId}/chapters/${id}`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
  remove: async (bookId: string, id: string): Promise<void> => {
    await client.delete(`/api/v1/admin/books/${bookId}/chapters/${id}`);
  },
  processAudio: async (bookId: string, id: string): Promise<Chapter> => {
    const { data } = await client.post<Chapter>(
      `/api/v1/admin/books/${bookId}/chapters/${id}/process-audio`,
    );
    return data;
  },
  publish: async (bookId: string, id: string): Promise<Chapter> => {
    const { data } = await client.put<Chapter>(
      `/api/v1/admin/books/${bookId}/chapters/${id}/publish`,
    );
    return data;
  },
  unpublish: async (bookId: string, id: string): Promise<Chapter> => {
    const { data } = await client.put<Chapter>(
      `/api/v1/admin/books/${bookId}/chapters/${id}/unpublish`,
    );
    return data;
  },
};
