'use client';

import type { QuizQuestion } from '@/lib/types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  answered: string | null;
}

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuizQuestionCard({ question, onAnswer, answered }: QuizQuestionCardProps) {
  const isCorrect = answered === question.correctAnswer;

  return (
    <div className="w-full">
      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-6 leading-relaxed whitespace-pre-wrap">
        {question.question}
      </p>

      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isThisCorrect = option === question.correctAnswer;
          const isThisWrong = option === answered && !isThisCorrect;
          const isOther = !!answered && option !== answered && !isThisCorrect;

          let cls =
            'w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ';

          if (!answered) {
            cls +=
              'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 cursor-pointer active:scale-[0.98]';
          } else if (isThisCorrect) {
            cls +=
              'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default';
          } else if (isThisWrong) {
            cls +=
              'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 cursor-default';
          } else if (isOther) {
            cls +=
              'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-default opacity-60';
          }

          const labelCls = !answered
            ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
            : isThisCorrect
              ? 'bg-green-500 text-white'
              : isThisWrong
                ? 'bg-red-400 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600';

          return (
            <button
              key={option}
              className={cls}
              onClick={() => !answered && onAnswer(option)}
              disabled={!!answered}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${labelCls}`}
              >
                {LABELS[idx]}
              </span>
              <span className="flex-1">{option}</span>
              {answered && isThisCorrect && <span className="text-green-500">✓</span>}
              {isThisWrong && <span className="text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`mt-5 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {isCorrect ? (
            <>
              <span className="text-xl">✅</span>
              <span>정답입니다!</span>
            </>
          ) : (
            <>
              <span className="text-xl">❌</span>
              <span>
                틀렸습니다. 정답은{' '}
                <strong className="underline underline-offset-2">{question.correctAnswer}</strong>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
