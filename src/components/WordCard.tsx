'use client';

import type { Word, Language } from '@/lib/types';
import { TTS_LANG_CODES } from '@/lib/types';
import { speakText, isTTSSupported } from '@/lib/tts';

interface WordCardProps {
  word: Word;
  language: Language;
}

export default function WordCard({ word, language }: WordCardProps) {
  const langCode = TTS_LANG_CODES[language];
  const ttsSupported = isTTSSupported();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{word.word}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {word.partOfSpeech}
            </span>
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{word.meaningKo}</p>
        </div>
        {ttsSupported && (
          <button
            onClick={() => speakText(word.word, langCode)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 transition-colors"
            aria-label={`${word.word} 발음 듣기`}
          >
            🔊
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{word.explanationKo}</p>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 italic">"{word.example}"</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{word.exampleKo}</p>
          </div>
          {ttsSupported && (
            <button
              onClick={() => speakText(word.example, langCode)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-400 transition-colors text-xs"
              aria-label="예문 발음 듣기"
            >
              🔊
            </button>
          )}
        </div>
      </div>

      {!ttsSupported && (
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">이 브라우저는 발음 기능을 지원하지 않습니다.</p>
      )}
    </div>
  );
}
