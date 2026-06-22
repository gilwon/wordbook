'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, QuizResult, Word } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getQuizResult } from '@/lib/storage';
import { getTodayWords } from '@/lib/words';
import { getTodayDate, VALID_LANGS } from '@/lib/utils';

function getScoreEmoji(percent: number): string {
  if (percent === 100) return '🏆';
  if (percent >= 80) return '🌟';
  if (percent >= 60) return '👍';
  if (percent >= 40) return '📖';
  return '💪';
}

export default function ResultPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [date] = useState(getTodayDate);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const quizResult = getQuizResult(lang as Language, date);
    if (!quizResult) {
      router.replace(`/${lang}`);
      return;
    }
    setResult(quizResult);

    const todayWords = getTodayWords(lang as Language, date);
    const wrong = todayWords.filter((w) => quizResult.wrongWordIds.includes(w.id));
    setWrongWords(wrong);
  }, [lang, router, date]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  if (!result) return null;

  const language = lang as Language;
  const emoji = getScoreEmoji(result.scorePercent);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{LANG_FLAGS[language]}</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{LANG_NAMES[language]} 퀴즈 결과</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm text-center">
        <div className="text-6xl mb-3">{emoji}</div>
        <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
          {result.scorePercent}점
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {result.correctCount}개 정답 / {result.correctCount + result.wrongWordIds.length}문제
        </p>

        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${result.scorePercent}%` }}
          />
        </div>
      </div>

      {wrongWords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span>❌</span> 틀린 단어 ({wrongWords.length}개)
          </h2>
          <div className="flex flex-col gap-2">
            {wrongWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">{word.word}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{word.meaningKo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {wrongWords.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
          <p className="text-green-700 dark:text-green-400 font-semibold">🎉 완벽! 모든 문제를 맞혔습니다!</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push(`/${lang}/quiz`)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow transition-colors"
        >
          다시 시험 보기
        </button>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 transition-colors"
        >
          오늘의 단어 보기
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 font-medium py-2 transition-colors text-sm"
        >
          언어 변경
        </button>
      </div>
    </div>
  );
}
