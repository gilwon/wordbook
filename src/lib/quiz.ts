import type { Word, QuizQuestion, QuizType } from '@/lib/types';
import { shuffleArray } from '@/lib/words';

function buildMeaningChoiceQuestion(
  word: Word,
  allWords: Word[],
  index: number
): QuizQuestion {
  const distractors = shuffleArray(
    allWords.filter((w) => w.id !== word.id),
    index * 31 + 7
  )
    .slice(0, 3)
    .map((w) => w.meaningKo);

  const options = shuffleArray(
    [word.meaningKo, ...distractors],
    index * 17 + 3
  );

  return {
    id: `q-${word.id}-mc`,
    type: 'meaning-choice',
    question: `"${word.word}"의 한국어 뜻은?`,
    options,
    correctAnswer: word.meaningKo,
    wordId: word.id,
  };
}

function buildWordChoiceQuestion(
  word: Word,
  allWords: Word[],
  index: number
): QuizQuestion {
  const distractors = shuffleArray(
    allWords.filter((w) => w.id !== word.id),
    index * 41 + 11
  )
    .slice(0, 3)
    .map((w) => w.word);

  const options = shuffleArray(
    [word.word, ...distractors],
    index * 23 + 5
  );

  const langName =
    word.language === 'en'
      ? '영어'
      : word.language === 'es'
      ? '스페인어'
      : '포르투갈어';

  return {
    id: `q-${word.id}-wc`,
    type: 'word-choice',
    question: `"${word.meaningKo}"에 해당하는 ${langName} 단어는?`,
    options,
    correctAnswer: word.word,
    wordId: word.id,
  };
}

function buildFillBlankQuestion(
  word: Word,
  allWords: Word[],
  index: number
): QuizQuestion {
  const regex = new RegExp(word.word, 'i');
  const questionText = word.example.replace(regex, '___');

  const distractors = shuffleArray(
    allWords.filter((w) => w.id !== word.id),
    index * 53 + 13
  )
    .slice(0, 3)
    .map((w) => w.word);

  const options = shuffleArray(
    [word.word, ...distractors],
    index * 37 + 9
  );

  return {
    id: `q-${word.id}-fb`,
    type: 'fill-blank',
    question: `빈칸에 알맞은 단어를 고르세요:\n"${questionText}"`,
    options,
    correctAnswer: word.word,
    wordId: word.id,
  };
}

export function generateQuiz(todayWords: Word[], allWords: Word[]): QuizQuestion[] {
  const typeDistribution: QuizType[] = [
    'meaning-choice',
    'meaning-choice',
    'meaning-choice',
    'meaning-choice',
    'word-choice',
    'word-choice',
    'word-choice',
    'fill-blank',
    'fill-blank',
    'fill-blank',
  ];

  const shuffledTypes = shuffleArray(typeDistribution, Date.now() % 99991);
  const shuffledWords = shuffleArray([...todayWords], Date.now() % 88801);

  const questions: QuizQuestion[] = shuffledWords.map((word, i) => {
    const type = shuffledTypes[i];
    switch (type) {
      case 'meaning-choice':
        return buildMeaningChoiceQuestion(word, allWords, i);
      case 'word-choice':
        return buildWordChoiceQuestion(word, allWords, i);
      case 'fill-blank':
        return buildFillBlankQuestion(word, allWords, i);
    }
  });

  return shuffleArray(questions, Date.now() % 77711);
}
