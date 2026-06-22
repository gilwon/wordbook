'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, Word, QuizResult } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getTodayWords } from '@/lib/words';
import { getQuizResult } from '@/lib/storage';
import { getTodayDate, VALID_LANGS } from '@/lib/utils';
import WordCard from '@/components/WordCard';
import ProgressBar from '@/components/ProgressBar';

export default function StudyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [date, setDate] = useState(getTodayDate);

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const today = getTodayDate();
    setDate(today);
    const todayWords = getTodayWords(lang as Language, today);
    setWords(todayWords);
    const quizResult = getQuizResult(lang as Language, today);
    setResult(quizResult);
  }, [lang, router]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  const language = lang as Language;

  const correctCount = result?.correctCount ?? 0;
  const totalQuestions = 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="홈으로"
        >
          ← 뒤로
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{LANG_FLAGS[language]}</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {LANG_NAMES[language]} 오늘의 단어
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <ProgressBar
          current={correctCount}
          total={totalQuestions}
          label={result ? `오늘 학습 진행률 (${date})` : `오늘의 단어 (${date})`}
        />
        {result && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            최근 시험 점수: {result.scorePercent}점 ({result.correctCount}/{totalQuestions})
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {words.map((word) => (
          <WordCard key={word.id} word={word} language={language} />
        ))}
      </div>

      {words.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500 py-8">단어를 불러오는 중...</p>
      )}

      <div className="sticky bottom-4">
        <button
          onClick={() => router.push(`/${lang}/quiz`)}
          disabled={words.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors disabled:opacity-50"
        >
          {result ? '다시 시험 보기 →' : '시험 보기 →'}
        </button>
      </div>
    </div>
  );
}
