import type { Language, QuizResult } from '@/lib/types';
import { VALID_LANGS } from '@/lib/utils';

const resultKey = (lang: Language, date: string) =>
  `word-quiz-result-${lang}-${date}`;

export function saveQuizResult(result: QuizResult): void {
  try {
    localStorage.setItem(resultKey(result.language, result.date), JSON.stringify(result));
  } catch {
    // quota exceeded or private browsing
  }
}

export function getQuizResult(language: Language, date: string): QuizResult | null {
  try {
    const stored = localStorage.getItem(resultKey(language, date));
    if (!stored) return null;
    return JSON.parse(stored) as QuizResult;
  } catch {
    return null;
  }
}

export function getSavedLanguage(): Language | null {
  try {
    const saved = localStorage.getItem('word-quiz-language');
    if (saved && (VALID_LANGS as string[]).includes(saved)) return saved as Language;
    return null;
  } catch {
    return null;
  }
}

export function setSavedLanguage(language: Language): void {
  try {
    localStorage.setItem('word-quiz-language', language);
  } catch {
    // quota exceeded or private browsing
  }
}
