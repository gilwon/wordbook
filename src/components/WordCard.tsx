'use client';

import type { Word, Language } from '@/lib/types';
import { TTS_LANG_CODES } from '@/lib/types';
import { speakText, isTTSSupported } from '@/lib/tts';

interface WordCardProps {
  word: Word;
  language: Language;
}

function SpeakButton({
  onClick,
  label,
  size = 'md',
  variant = 'foreign',
}: {
  onClick: () => void;
  label: string;
  size?: 'sm' | 'md';
  variant?: 'foreign' | 'ko';
}) {
  const cls =
    variant === 'ko'
      ? size === 'md'
        ? 'w-11 h-11 text-base bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
        : 'w-9 h-9 text-sm bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
      : size === 'md'
        ? 'w-11 h-11 text-base bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600'
        : 'w-9 h-9 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-400';

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center justify-center rounded-full transition-all active:scale-90 ${cls}`}
      aria-label={label}
    >
      🔊
    </button>
  );
}

export default function WordCard({ word, language }: WordCardProps) {
  const langCode = TTS_LANG_CODES[language];
  const ttsSupported = isTTSSupported();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      {/* Word + meaning row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
              {word.word}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full shrink-0">
              {word.partOfSpeech}
            </span>
          </div>
          {word.phonetic && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-0.5">{word.phonetic}</p>
          )}
          <div className="flex items-center gap-2">
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{word.meaningKo}</p>
            {ttsSupported && (
              <SpeakButton
                onClick={() => speakText(word.meaningKo, 'ko-KR')}
                label="한국어 뜻 듣기"
                size="sm"
                variant="ko"
              />
            )}
          </div>
        </div>
        {ttsSupported && (
          <SpeakButton
            onClick={() => speakText(word.word, langCode)}
            label={`${word.word} 발음 듣기`}
            size="md"
          />
        )}
      </div>

      {/* Explanation */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
        {word.explanationKo}
      </p>

      {/* Example sentence */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 italic leading-relaxed flex-1">
                &ldquo;{word.example}&rdquo;
              </p>
              {ttsSupported && (
                <SpeakButton
                  onClick={() => speakText(word.example, langCode)}
                  label="예문 발음 듣기"
                  size="sm"
                />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">{word.exampleKo}</p>
              {ttsSupported && (
                <SpeakButton
                  onClick={() => speakText(word.exampleKo, 'ko-KR')}
                  label="한국어 예문 듣기"
                  size="sm"
                  variant="ko"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
