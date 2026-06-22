import { describe, it, expect } from 'vitest';
import { generateQuiz } from '@/lib/quiz';
import { getTodayWords } from '@/lib/words';
import { allWords } from '@/data/index';

describe('generateQuiz', () => {
  const todayWords = getTodayWords('en', '2026-06-22', '중급');
  const quiz = generateQuiz(todayWords, allWords['en']);

  it('generates exactly 10 questions', () => {
    expect(quiz).toHaveLength(10);
  });

  it('each question has exactly 4 options', () => {
    quiz.forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  it('correct answer is always in options', () => {
    quiz.forEach((q) => {
      expect(q.options).toContain(q.correctAnswer);
    });
  });

  it('all today words appear at least once', () => {
    const coveredWordIds = new Set(quiz.map((q) => q.wordId));
    todayWords.forEach((w) => {
      expect(coveredWordIds.has(w.id)).toBe(true);
    });
  });

  it('only uses valid question types', () => {
    const validTypes = ['meaning-choice', 'word-choice', 'fill-blank'];
    quiz.forEach((q) => {
      expect(validTypes).toContain(q.type);
    });
  });

  it('each question has a non-empty id', () => {
    quiz.forEach((q) => {
      expect(q.id).toBeTruthy();
    });
  });

  it('each question has a non-empty question text', () => {
    quiz.forEach((q) => {
      expect(q.question).toBeTruthy();
    });
  });

  it('options contain no duplicates per question', () => {
    quiz.forEach((q) => {
      const unique = new Set(q.options);
      expect(unique.size).toBe(4);
    });
  });

  it('is deterministic for same inputs', () => {
    const quiz2 = generateQuiz(todayWords, allWords['en']);
    const ids1 = quiz.map((q) => q.id).join(',');
    const ids2 = quiz2.map((q) => q.id).join(',');
    expect(ids1).toBe(ids2);
  });

  it('generates different order for different days', () => {
    const otherWords = getTodayWords('en', '2026-06-23', '중급');
    const quiz2 = generateQuiz(otherWords, allWords['en']);
    const ids1 = quiz.map((q) => q.id).join(',');
    const ids2 = quiz2.map((q) => q.id).join(',');
    expect(ids1).not.toBe(ids2);
  });
});
