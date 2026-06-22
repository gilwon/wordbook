'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, Difficulty, QuizResult, Word } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getQuizResult, getSavedDifficulty } from '@/lib/storage';
import { getTodayWords } from '@/lib/words';
import { getTodayDate, VALID_LANGS, DEFAULT_DIFFICULTY } from '@/lib/utils';

interface ScoreInfo {
  emoji: string;
  message: string;
  color: string;
}

function getScoreInfo(percent: number): ScoreInfo {
  if (percent === 100) return { emoji: '🏆', message: '완벽합니다! 오늘의 챔피언!', color: 'text-yellow-500' };
  if (percent >= 80) return { emoji: '🌟', message: '훌륭합니다! 거의 다 외웠어요!', color: 'text-indigo-500 dark:text-indigo-400' };
  if (percent >= 60) return { emoji: '👍', message: '잘 했어요! 조금 더 연습해봐요', color: 'text-green-500 dark:text-green-400' };
  if (percent >= 40) return { emoji: '📖', message: '천천히 복습하면 실력이 늘어요', color: 'text-orange-500 dark:text-orange-400' };
  return { emoji: '💪', message: '포기하지 마세요! 반복이 실력입니다', color: 'text-red-500 dark:text-red-400' };
}

export default function ResultPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [date] = useState(getTodayDate);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const d = getSavedDifficulty() ?? DEFAULT_DIFFICULTY;
    setDifficulty(d);
    const quizResult = getQuizResult(lang as Language, d, date);
    if (!quizResult) {
      router.replace(`/${lang}`);
      return;
    }
    setResult(quizResult);

    const todayWords = getTodayWords(lang as Language, date, d);
    const wrong = todayWords.filter((w) => quizResult.wrongWordIds.includes(w.id));
    setWrongWords(wrong);
  }, [lang, router, date]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  if (!result) return null;

  const language = lang as Language;
  const { emoji, message, color } = getScoreInfo(result.scorePercent);
  const totalCount = result.correctCount + result.wrongWordIds.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xl">{LANG_FLAGS[language]}</span>
        <span className="font-bold text-gray-900 dark:text-gray-100">{LANG_NAMES[language]} 퀴즈 결과</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          difficulty === '기초' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          : difficulty === '고급' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
        }`}>
          {difficulty}
        </span>
      </div>

      {/* Score card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <div className={`text-5xl font-bold mb-1 ${color}`}>
          {result.scorePercent}점
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
          {result.correctCount}개 정답 / {totalCount}문제
        </p>
        <p className={`text-sm font-medium mb-5 ${color}`}>{message}</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${result.scorePercent}%`,
              backgroundColor: result.scorePercent === 100
                ? '#eab308'
                : result.scorePercent >= 60
                  ? '#6366f1'
                  : '#f97316',
            }}
          />
        </div>
      </div>

      {/* Wrong words */}
      {wrongWords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span>❌</span>
            <span>틀린 단어</span>
            <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {wrongWords.length}개
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {wrongWords.map((word) => (
              <div
                key={word.id}
                className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{word.word}</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">{word.meaningKo}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                  {word.explanationKo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perfect score */}
      {wrongWords.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 text-center">
          <p className="text-yellow-700 dark:text-yellow-400 font-bold text-lg">🎉 완벽한 점수!</p>
          <p className="text-yellow-600 dark:text-yellow-500 text-sm mt-1">모든 단어를 완벽하게 외웠습니다</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push(`/${lang}/quiz`)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-md transition-all"
        >
          다시 시험 보기
        </button>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 transition-colors"
        >
          오늘의 단어 복습
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
