import { describe, it, expect } from 'vitest';
import { allWords } from '@/data/index';
import type { Language } from '@/lib/types';
import { DIFFICULTY_LABELS } from '@/lib/types';

describe('word data', () => {
  const langs: Language[] = ['en', 'es', 'ja'];

  langs.forEach((lang) => {
    it(`${lang} has at least 30 words`, () => {
      expect(allWords[lang].length).toBeGreaterThanOrEqual(30);
    });

    it(`${lang} words have all required fields`, () => {
      allWords[lang].forEach((word) => {
        expect(word.id).toBeTruthy();
        expect(word.language).toBe(lang);
        expect(word.word).toBeTruthy();
        expect(word.meaningKo).toBeTruthy();
        expect(word.partOfSpeech).toBeTruthy();
        expect(word.explanationKo).toBeTruthy();
        expect(word.example).toBeTruthy();
        expect(word.exampleKo).toBeTruthy();
        expect(DIFFICULTY_LABELS).toContain(word.difficulty);
      });
    });

    it(`${lang} word ids are unique`, () => {
      const ids = allWords[lang].map((w) => w.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it(`${lang} has words for each difficulty level`, () => {
      const difficulties = new Set(allWords[lang].map((w) => w.difficulty));
      expect(difficulties.has('기초')).toBe(true);
      expect(difficulties.has('중급')).toBe(true);
      expect(difficulties.has('고급')).toBe(true);
    });
  });
});
