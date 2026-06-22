'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, Difficulty } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS, DIFFICULTY_LABELS } from '@/lib/types';
import { getSavedLanguage, setSavedLanguage, getSavedDifficulty, setSavedDifficulty } from '@/lib/storage';
import { getTodayDate, DEFAULT_DIFFICULTY } from '@/lib/utils';

const LANGUAGES: Language[] = ['en', 'es', 'ja'];

const LANG_SUBTITLES: Record<Language, string> = {
  en: 'English · 영어',
  es: 'Español · 스페인어',
  ja: '日本語 · 일본어',
};

export default function HomePage() {
  const router = useRouter();
  const [lastLang, setLastLang] = useState<Language | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [today] = useState(getTodayDate);

  useEffect(() => {
    const saved = getSavedLanguage();
    if (saved) {
      setLastLang(saved);
      router.prefetch(`/${saved}`);
    }
    const savedDiff = getSavedDifficulty();
    if (savedDiff) setDifficulty(savedDiff);
  }, [router]);

  function handleLanguageSelect(lang: Language) {
    setSavedLanguage(lang);
    router.push(`/${lang}`);
  }

  function handleDifficultySelect(d: Difficulty) {
    setDifficulty(d);
    setSavedDifficulty(d);
  }

  const dateDisplay = today.replace(/-/g, '.');

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">{dateDisplay}</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">📚 단어 퀴즈</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          매일 10개 단어 학습 · 퀴즈로 기억 확인
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {lastLang && (
          <>
            <button
              onClick={() => handleLanguageSelect(lastLang)}
              className="flex items-center gap-4 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-2xl px-6 py-5 transition-all shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/40"
            >
              <span className="text-3xl">{LANG_FLAGS[lastLang]}</span>
              <div className="text-left flex-1">
                <p className="text-xs text-indigo-200 font-medium tracking-wide mb-0.5">오늘 학습 계속하기</p>
                <p className="font-bold text-white text-lg">{LANG_NAMES[lastLang]}</p>
              </div>
              <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
              다른 언어
            </p>
          </>
        )}

        {!lastLang && (
          <p className="text-center text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            언어를 선택하세요
          </p>
        )}

        {LANGUAGES.filter((l) => l !== lastLang).map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageSelect(lang)}
            className="flex items-center gap-4 w-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 px-6 py-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">{LANG_FLAGS[lang]}</span>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {LANG_NAMES[lang]}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">{LANG_SUBTITLES[lang]}</p>
            </div>
            <svg
              className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        {/* 난이도 선택 */}
        <div className="mt-2">
          <p className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            난이도
          </p>
          <div className="flex gap-2">
            {DIFFICULTY_LABELS.map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultySelect(d)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
