'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Language } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getSavedLanguage, setSavedLanguage } from '@/lib/storage';

const LANGUAGES: Language[] = ['en', 'es', 'pt'];

const LANG_DESCRIPTIONS: Record<Language, string> = {
  en: '영어 단어 학습',
  es: '스페인어 단어 학습',
  pt: '포르투갈어 단어 학습',
};

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const saved = getSavedLanguage();
    if (saved && LANGUAGES.includes(saved as Language)) {
      router.prefetch(`/${saved}`);
    }
  }, [router]);

  function handleLanguageSelect(lang: Language) {
    setSavedLanguage(lang);
    router.push(`/${lang}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 단어 퀴즈</h1>
        <p className="text-gray-500 text-base">
          매일 10개의 단어를 학습하고 퀴즈로 기억을 확인하세요
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wide">
          언어를 선택하세요
        </p>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageSelect(lang)}
            className="flex items-center gap-4 w-full bg-white rounded-2xl border-2 border-gray-100 px-6 py-4 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">{LANG_FLAGS[lang]}</span>
            <div className="text-left">
              <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {LANG_NAMES[lang]}
              </p>
              <p className="text-sm text-gray-400">{LANG_DESCRIPTIONS[lang]}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
