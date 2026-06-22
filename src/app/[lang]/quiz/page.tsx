'use client';

import { use, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, QuizQuestion } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getTodayWords } from '@/lib/words';
import { generateQuiz } from '@/lib/quiz';
import { saveQuizResult } from '@/lib/storage';
import { getTodayDate, VALID_LANGS } from '@/lib/utils';
import { allWords } from '@/data/index';
import QuizQuestionCard from '@/components/QuizQuestion';
import ProgressBar from '@/components/ProgressBar';

export default function QuizPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [wrongWordIds, setWrongWordIds] = useState<string[]>([]);
  const correctCountRef = useRef(0);
  const [date] = useState(getTodayDate);

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const todayWords = getTodayWords(lang as Language, date);
    const quiz = generateQuiz(todayWords, allWords[lang as Language]);
    setQuestions(quiz);
  }, [lang, router, date]);

  const handleAnswer = useCallback(
    (answer: string) => {
      setAnswered(answer);
      const question = questions[currentIndex];
      if (answer === question.correctAnswer) {
        correctCountRef.current += 1;
      } else {
        setWrongWordIds((prev) =>
          prev.includes(question.wordId) ? prev : [...prev, question.wordId]
        );
      }
    },
    [questions, currentIndex]
  );

  const handleNext = useCallback(() => {
    const isLast = currentIndex === questions.length - 1;

    if (isLast) {
      const finalCorrect = correctCountRef.current;
      const total = questions.length;
      const scorePercent = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
      saveQuizResult({
        language: lang as Language,
        date,
        correctCount: finalCorrect,
        scorePercent,
        wrongWordIds,
        completedAt: new Date().toISOString(),
      });
      router.push(`/${lang}/quiz/result`);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(null);
    }
  }, [currentIndex, questions, wrongWordIds, lang, date, router]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 dark:text-gray-500">퀴즈를 준비하는 중...</p>
      </div>
    );
  }

  const language = lang as Language;
  const question = questions[currentIndex];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/${lang}`)}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="학습으로 돌아가기"
        >
          ← 뒤로
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{LANG_FLAGS[language]}</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{LANG_NAMES[language]} 퀴즈</span>
        </div>
      </div>

      <ProgressBar
        current={currentIndex + (answered ? 1 : 0)}
        total={questions.length}
        label={`문제 ${currentIndex + 1} / ${questions.length}`}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <QuizQuestionCard
          question={question}
          onAnswer={handleAnswer}
          answered={answered}
        />
      </div>

      {answered && (
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow transition-colors"
        >
          {currentIndex === questions.length - 1 ? '결과 보기 →' : '다음 문제 →'}
        </button>
      )}
    </div>
  );
}
