import { useCallback, useState } from 'react';
import { message } from 'antd';
import { uploadFile, type UploadCategory, type UploadResult } from '../api/upload';

interface UseFileUploadOptions {
  category: UploadCategory;
  maxSizeKb?: number;
}

interface UseFileUploadReturn {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  result: UploadResult | null;
  progress: number;
  selectFile: (file: File) => boolean;
  upload: () => Promise<void>;
  clear: () => void;
}

export function useFileUpload({ category, maxSizeKb }: UseFileUploadOptions): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [progress, setProgress] = useState(0);

  const selectFile = useCallback(
    (f: File): boolean => {
      if (maxSizeKb && f.size > maxSizeKb * 1024) {
        message.error(`File must be under ${maxSizeKb}KB`);
        return false;
      }
      setFile(f);
      setUploaded(false);
      setError(null);
      setResult(null);
      setProgress(0);
      return true;
    },
    [maxSizeKb],
  );

  const upload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const res = await uploadFile(file, category, setProgress);
      setResult(res);
      setUploaded(true);
      message.success('File uploaded');
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      const msg = detail || 'Upload failed';
      setError(msg);
      message.error(msg);
    } finally {
      setUploading(false);
    }
  }, [file, category]);

  const clear = useCallback(() => {
    setFile(null);
    setUploading(false);
    setUploaded(false);
    setError(null);
    setResult(null);
    setProgress(0);
  }, []);

  return { file, uploading, uploaded, error, result, progress, selectFile, upload, clear };
}
