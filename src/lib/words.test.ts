import { describe, it, expect } from 'vitest';
import { getTodayWords, shuffleArray, hashString } from '@/lib/words';
import { allWords } from '@/data/index';

describe('hashString', () => {
  it('returns same value for same input', () => {
    expect(hashString('test')).toBe(hashString('test'));
  });

  it('returns different value for different input', () => {
    expect(hashString('en-2026-06-22')).not.toBe(hashString('en-2026-06-23'));
  });

  it('returns non-negative number', () => {
    expect(hashString('any-string')).toBeGreaterThanOrEqual(0);
  });
});

describe('shuffleArray', () => {
  it('returns array with same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr, 42);
    expect(result).toHaveLength(5);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3];
    shuffleArray(arr, 1);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('returns same order for same seed', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr, 99)).toEqual(shuffleArray(arr, 99));
  });

  it('returns different order for different seeds', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = shuffleArray(arr, 1);
    const b = shuffleArray(arr, 2);
    expect(a).not.toEqual(b);
  });
});

describe('getTodayWords', () => {
  it('returns exactly 10 words', () => {
    const words = getTodayWords('en', '2026-06-22');
    expect(words).toHaveLength(10);
  });

  it('returns words of correct language', () => {
    const words = getTodayWords('es', '2026-06-22');
    words.forEach((w) => expect(w.language).toBe('es'));
  });

  it('returns same words for same date and language', () => {
    const a = getTodayWords('en', '2026-06-22');
    const b = getTodayWords('en', '2026-06-22');
    expect(a.map((w) => w.id)).toEqual(b.map((w) => w.id));
  });

  it('returns different words for different dates', () => {
    const a = getTodayWords('en', '2026-06-22');
    const b = getTodayWords('en', '2026-06-23');
    const aIds = a.map((w) => w.id).join(',');
    const bIds = b.map((w) => w.id).join(',');
    expect(aIds).not.toBe(bIds);
  });

  it('returns words that exist in full word list', () => {
    const words = getTodayWords('pt', '2026-06-22');
    const allPtIds = allWords.pt.map((w) => w.id);
    words.forEach((w) => expect(allPtIds).toContain(w.id));
  });
});
