import type { Language, QuizResult } from '@/lib/types';

const resultKey = (lang: Language, date: string) =>
  `word-quiz-result-${lang}-${date}`;

export function saveQuizResult(result: QuizResult): void {
  localStorage.setItem(resultKey(result.language, result.date), JSON.stringify(result));
}

export function getQuizResult(language: Language, date: string): QuizResult | null {
  const stored = localStorage.getItem(resultKey(language, date));
  return stored ? (JSON.parse(stored) as QuizResult) : null;
}

export function getSavedLanguage(): string | null {
  return localStorage.getItem('word-quiz-language');
}

export function setSavedLanguage(language: Language): void {
  localStorage.setItem('word-quiz-language', language);
}
