import { client } from './client';

export const UploadCategory = {
  BOOK_THUMBNAIL: 'book_thumbnail',
  BOOK_AUDIO: 'book_audio',
  CHAPTER_THUMBNAIL: 'chapter_thumbnail',
  CHAPTER_AUDIO: 'chapter_audio',
} as const;

export type UploadCategory = (typeof UploadCategory)[keyof typeof UploadCategory];

export interface UploadResult {
  url: string | null;
  path: string;
}

export type ProgressCb = (percent: number) => void;

export async function uploadFile(
  file: File,
  category: UploadCategory,
  onProgress?: ProgressCb,
): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);

  const { data } = await client.post<UploadResult>('/api/v1/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) =>
      onProgress?.(Math.round((e.loaded * 100) / (e.total ?? e.loaded))),
  });
  return data;
}
