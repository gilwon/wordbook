import type { Language, Word } from '@/lib/types';
import { wordsEn } from './words-en';
import { wordsEs } from './words-es';
import { wordsPt } from './words-pt';

export const allWords: Record<Language, Word[]> = {
  en: wordsEn,
  es: wordsEs,
  pt: wordsPt,
};

export { wordsEn, wordsEs, wordsPt };
