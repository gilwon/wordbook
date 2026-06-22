'use client';

import type { QuizQuestion } from '@/lib/types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  answered: string | null;
}

export default function QuizQuestionCard({
  question,
  onAnswer,
  answered,
}: QuizQuestionCardProps) {
  const isCorrect = answered === question.correctAnswer;

  return (
    <div className="w-full">
      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-5 leading-relaxed whitespace-pre-wrap">
        {question.question}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => {
          let buttonClass =
            'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ';

          if (!answered) {
            buttonClass +=
              'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 cursor-pointer';
          } else if (option === question.correctAnswer) {
            buttonClass +=
              'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default';
          } else if (option === answered && option !== question.correctAnswer) {
            buttonClass +=
              'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 cursor-default';
          } else {
            buttonClass +=
              'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-default';
          }

          return (
            <button
              key={option}
              className={buttonClass}
              onClick={() => !answered && onAnswer(option)}
              disabled={!!answered}
            >
              <span className="font-semibold mr-2 text-gray-400 dark:text-gray-500">
                {['①', '②', '③', '④'][idx]}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm font-medium ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {isCorrect ? (
            <span>✅ 정답입니다!</span>
          ) : (
            <span>
              ❌ 틀렸습니다. 정답은 <strong>"{question.correctAnswer}"</strong>입니다.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
