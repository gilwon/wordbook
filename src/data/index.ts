import type { Language, Word } from '@/lib/types';
import { wordsEn } from './words-en';
import { wordsEs } from './words-es';
import { wordsJa } from './words-ja';

export const allWords: Record<Language, Word[]> = {
  en: wordsEn,
  es: wordsEs,
  ja: wordsJa,
};

export { wordsEn, wordsEs, wordsJa };
