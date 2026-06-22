import { describe, it, expect, beforeEach } from 'vitest';
import { saveQuizResult, getQuizResult } from '@/lib/storage';
import type { QuizResult } from '@/lib/types';

const mockResult: QuizResult = {
  language: 'en',
  date: '2026-06-22',
  correctCount: 7,
  scorePercent: 70,
  wrongWordIds: ['en-003', 'en-007', 'en-015'],
  completedAt: '2026-06-22T10:30:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
});

describe('saveQuizResult', () => {
  it('saves result to localStorage', () => {
    saveQuizResult(mockResult);
    const stored = localStorage.getItem('word-quiz-result-en-2026-06-22');
    expect(stored).not.toBeNull();
  });

  it('stored value parses to original result', () => {
    saveQuizResult(mockResult);
    const stored = localStorage.getItem('word-quiz-result-en-2026-06-22');
    expect(JSON.parse(stored!)).toEqual(mockResult);
  });
});

describe('getQuizResult', () => {
  it('returns null when no result saved', () => {
    expect(getQuizResult('en', '2026-06-22')).toBeNull();
  });

  it('returns saved result', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('en', '2026-06-22')).toEqual(mockResult);
  });

  it('returns null for different language', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('es', '2026-06-22')).toBeNull();
  });

  it('returns null for different date', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('en', '2026-06-23')).toBeNull();
  });
});
