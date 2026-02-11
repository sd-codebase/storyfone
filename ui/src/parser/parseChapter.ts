import { CHAPTER_PATTERN, devanagariToArabic } from './patterns';

export interface ChapterHeader {
  number: number;
  title: string;
}

export function parseChapterHeader(lines: string[]): ChapterHeader | null {
  for (const line of lines) {
    const match = line.match(CHAPTER_PATTERN);
    if (match) {
      return {
        number: parseInt(devanagariToArabic(match[1]), 10),
        title: match[2].trim(),
      };
    }
  }
  return null;
}
