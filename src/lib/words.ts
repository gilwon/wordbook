import type { Language, Word } from '@/lib/types';
import { allWords } from '@/data/index';

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function shuffleArray<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let s = seed;
  let currentIndex = arr.length;

  while (currentIndex !== 0) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const randomIndex = Math.abs(s) % currentIndex;
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}

export function getTodayWords(language: Language, date: string): Word[] {
  const words = allWords[language];
  const seed = hashString(`${language}-${date}`);
  const shuffled = shuffleArray(words, seed);
  return shuffled.slice(0, 10);
}
