import type { Language, Difficulty } from '@/lib/types';

export const VALID_LANGS: Language[] = ['en', 'es', 'ja'];

export const DEFAULT_DIFFICULTY: Difficulty = '중급';

export function getTodayDate(): string {
  // KST 고정 — 서버 UTC vs 브라우저 로컬 타임존 하이드레이션 불일치 방지
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}
