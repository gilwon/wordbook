import type { Language, Difficulty, QuizResult } from '@/lib/types';
import { VALID_LANGS, DEFAULT_DIFFICULTY } from '@/lib/utils';

const resultKey = (lang: Language, difficulty: Difficulty, date: string) =>
  `word-quiz-result-${lang}-${difficulty}-${date}`;

export function saveQuizResult(result: QuizResult): void {
  try {
    localStorage.setItem(resultKey(result.language, result.difficulty, result.date), JSON.stringify(result));
  } catch {
    // quota exceeded or private browsing
  }
}

export function getQuizResult(language: Language, difficulty: Difficulty, date: string): QuizResult | null {
  try {
    const stored = localStorage.getItem(resultKey(language, difficulty, date));
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

export function getSavedDifficulty(): Difficulty | null {
  try {
    const saved = localStorage.getItem('word-quiz-difficulty');
    const valid: Difficulty[] = ['기초', '중급', '고급'];
    if (saved && valid.includes(saved as Difficulty)) return saved as Difficulty;
    return null;
  } catch {
    return null;
  }
}

export function setSavedDifficulty(difficulty: Difficulty): void {
  try {
    localStorage.setItem('word-quiz-difficulty', difficulty);
  } catch {
    // quota exceeded or private browsing
  }
}

