import { describe, it, expect, beforeEach } from 'vitest';
import { saveQuizResult, getQuizResult, getSavedDifficulty, setSavedDifficulty } from '@/lib/storage';
import type { QuizResult } from '@/lib/types';

const mockResult: QuizResult = {
  language: 'en',
  difficulty: '중급',
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
    const stored = localStorage.getItem('word-quiz-result-en-중급-2026-06-22');
    expect(stored).not.toBeNull();
  });

  it('stored value parses to original result', () => {
    saveQuizResult(mockResult);
    const stored = localStorage.getItem('word-quiz-result-en-중급-2026-06-22');
    expect(JSON.parse(stored!)).toEqual(mockResult);
  });
});

describe('getQuizResult', () => {
  it('returns null when no result saved', () => {
    expect(getQuizResult('en', '중급', '2026-06-22')).toBeNull();
  });

  it('returns saved result', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('en', '중급', '2026-06-22')).toEqual(mockResult);
  });

  it('returns null for different language', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('es', '중급', '2026-06-22')).toBeNull();
  });

  it('returns null for different difficulty', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('en', '기초', '2026-06-22')).toBeNull();
  });

  it('returns null for different date', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('en', '중급', '2026-06-23')).toBeNull();
  });
});

describe('getSavedDifficulty / setSavedDifficulty', () => {
  it('returns null when nothing saved', () => {
    expect(getSavedDifficulty()).toBeNull();
  });

  it('returns saved difficulty', () => {
    setSavedDifficulty('고급');
    expect(getSavedDifficulty()).toBe('고급');
  });

  it('returns null for invalid value in storage', () => {
    localStorage.setItem('word-quiz-difficulty', 'invalid');
    expect(getSavedDifficulty()).toBeNull();
  });
});
