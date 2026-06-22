export type Language = "en" | "es" | "pt";

export interface Word {
  id: string;
  language: Language;
  word: string;
  meaningKo: string;
  partOfSpeech: string;
  explanationKo: string;
  example: string;
  exampleKo: string;
}

export type QuizType = "meaning-choice" | "word-choice" | "fill-blank";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options: string[];
  correctAnswer: string;
  wordId: string;
}

export interface QuizResult {
  language: Language;
  date: string;
  correctCount: number;
  scorePercent: number;
  wrongWordIds: string[];
  completedAt: string;
}

export const LANG_NAMES: Record<Language, string> = {
  en: "영어",
  es: "스페인어",
  pt: "포르투갈어",
};

export const TTS_LANG_CODES: Record<Language, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
};

export const LANG_FLAGS: Record<Language, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  pt: "🇧🇷",
};
