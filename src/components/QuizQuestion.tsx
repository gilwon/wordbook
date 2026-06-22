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
      <p className="text-base font-medium text-gray-800 mb-5 leading-relaxed whitespace-pre-wrap">
        {question.question}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => {
          let buttonClass =
            'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ';

          if (!answered) {
            buttonClass += 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 cursor-pointer';
          } else if (option === question.correctAnswer) {
            buttonClass += 'border-green-500 bg-green-50 text-green-700 cursor-default';
          } else if (option === answered && option !== question.correctAnswer) {
            buttonClass += 'border-red-400 bg-red-50 text-red-700 cursor-default';
          } else {
            buttonClass += 'border-gray-200 bg-gray-50 text-gray-400 cursor-default';
          }

          return (
            <button
              key={idx}
              className={buttonClass}
              onClick={() => !answered && onAnswer(option)}
              disabled={!!answered}
            >
              <span className="font-semibold mr-2 text-gray-400">
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
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
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
