'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, Difficulty, Word, QuizResult } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getTodayWords } from '@/lib/words';
import { getQuizResult, getSavedDifficulty } from '@/lib/storage';
import { getTodayDate, VALID_LANGS, DEFAULT_DIFFICULTY } from '@/lib/utils';
import WordCard from '@/components/WordCard';
import ProgressBar from '@/components/ProgressBar';

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  기초: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  중급: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  고급: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
};

export default function StudyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [date] = useState(getTodayDate);

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const d = getSavedDifficulty() ?? DEFAULT_DIFFICULTY;
    setDifficulty(d);
    const todayWords = getTodayWords(lang as Language, date, d);
    setWords(todayWords);
    const quizResult = getQuizResult(lang as Language, d, date);
    setResult(quizResult);
  }, [lang, router, date]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  const language = lang as Language;

  const correctCount = result?.correctCount ?? 0;
  const totalQuestions = 10;

  return (
    <div className="flex flex-col gap-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
          aria-label="홈으로"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl">{LANG_FLAGS[language]}</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
            {LANG_NAMES[language]}
          </h1>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${DIFFICULTY_COLORS[difficulty]}`}>
            {difficulty}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:block">오늘의 단어</span>
        </div>
        {words.length > 0 && (
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full shrink-0">
            {words.length}개
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <ProgressBar
          current={correctCount}
          total={totalQuestions}
          label={result ? '오늘 퀴즈 점수' : date}
        />
        {result && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            {result.scorePercent}점 달성 · {result.correctCount}/{totalQuestions} 정답
          </p>
        )}
      </div>

      {/* Word list */}
      <div className="flex flex-col gap-4">
        {words.length > 0
          ? words.map((word) => <WordCard key={word.id} word={word} language={language} />)
          : Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-28 mb-2" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-700/60 rounded w-16" />
                  </div>
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700/60 rounded-full" />
                </div>
                <div className="h-3.5 bg-gray-100 dark:bg-gray-700/60 rounded w-full mb-3" />
                <div className="h-3.5 bg-gray-100 dark:bg-gray-700/60 rounded w-4/5" />
              </div>
            ))}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/90 dark:via-gray-900/90 to-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push(`/${lang}/quiz`)}
            disabled={words.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {result ? '다시 시험 보기 →' : '시험 보기 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
