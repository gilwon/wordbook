'use client';

import { useState } from 'react';
import type { Word, Language } from '@/lib/types';
import { TTS_LANG_CODES } from '@/lib/types';
import { speakText, isTTSSupported } from '@/lib/tts';

interface WordCardProps {
  word: Word;
  language: Language;
}

type KoPart = { text: string; segIndex: number | null };

function parseKoParts(exampleKo: string, segments: { ko: string }[]): KoPart[] {
  const parts: KoPart[] = [];
  let remaining = exampleKo;
  for (let i = 0; i < segments.length; i++) {
    const ko = segments[i].ko;
    const idx = remaining.indexOf(ko);
    if (idx === -1) return [{ text: exampleKo, segIndex: null }];
    if (idx > 0) parts.push({ text: remaining.slice(0, idx), segIndex: null });
    parts.push({ text: ko, segIndex: i });
    remaining = remaining.slice(idx + ko.length);
  }
  if (remaining) parts.push({ text: remaining, segIndex: null });
  return parts;
}

function SpeakButton({ onClick, label, size = 'md' }: { onClick: () => void; label: string; size?: 'sm' | 'md' }) {
  const cls =
    size === 'md'
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const highlightCls = (i: number) =>
    hoveredIndex === i
      ? 'bg-yellow-200 dark:bg-yellow-400/30 rounded'
      : '';

  function handleTouchSegment(i: number) {
    setHoveredIndex((prev) => (prev === i ? null : i));
  }

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
          {(word.phonetic || word.pronunciationKo) && (
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              {word.phonetic && (
                <span className="text-sm text-gray-400 dark:text-gray-500">{word.phonetic}</span>
              )}
              {word.pronunciationKo && (
                <>
                  {word.phonetic && <span className="text-gray-300 dark:text-gray-600">·</span>}
                  <span className="text-sm text-indigo-400 dark:text-indigo-500 font-medium">{word.pronunciationKo}</span>
                </>
              )}
            </div>
          )}
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{word.meaningKo}</p>
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
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Original example */}
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 italic leading-relaxed">
              &ldquo;
              {word.exampleSegments
                ? word.exampleSegments.map((seg, i) => (
                    <span
                      key={i}
                      className={`transition-colors ${highlightCls(i)}`}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onTouchStart={() => handleTouchSegment(i)}
                    >
                      {seg.original}
                    </span>
                  ))
                : word.example}
              &rdquo;
            </p>

            {/* Pronunciation */}
            {word.examplePronunciationKo && (
              <p className="text-xs text-indigo-400 dark:text-indigo-500 font-medium mt-1">
                {word.examplePronunciationKo}
              </p>
            )}

            {/* Korean translation */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {word.exampleSegments
                ? parseKoParts(word.exampleKo, word.exampleSegments).map((part, i) =>
                    part.segIndex !== null ? (
                      <span
                        key={i}
                        className={`transition-colors cursor-pointer ${highlightCls(part.segIndex)}`}
                        onMouseEnter={() => setHoveredIndex(part.segIndex!)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onTouchStart={() => handleTouchSegment(part.segIndex!)}
                      >
                        {part.text}
                      </span>
                    ) : (
                      <span key={i}>{part.text}</span>
                    )
                  )
                : word.exampleKo}
            </p>
          </div>

          {ttsSupported && (
            <SpeakButton
              onClick={() => speakText(word.example, langCode)}
              label="예문 발음 듣기"
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
