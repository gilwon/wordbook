export type Language = "en" | "es" | "ja";

export type Difficulty = "기초" | "중급" | "고급";

export interface Word {
  id: string;
  language: Language;
  word: string;
  phonetic?: string;
  meaningKo: string;
  partOfSpeech: string;
  explanationKo: string;
  example: string;
  exampleKo: string;
  difficulty: Difficulty;
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
  difficulty: Difficulty;
  date: string;
  correctCount: number;
  scorePercent: number;
  wrongWordIds: string[];
  completedAt: string;
}

export const LANG_NAMES: Record<Language, string> = {
  en: "영어",
  es: "스페인어",
  ja: "일본어",
};

export const TTS_LANG_CODES: Record<Language, string> = {
  en: "en-US",
  es: "es-ES",
  ja: "ja-JP",
};

export const LANG_FLAGS: Record<Language, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  ja: "🇯🇵",
};

export const DIFFICULTY_LABELS: Difficulty[] = ["기초", "중급", "고급"];
