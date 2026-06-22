# Word Quiz App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app for daily vocabulary learning in English, Spanish, and Portuguese with quiz functionality and TTS support.

**Architecture:** Single Next.js 14 App Router app with all client-side state. Static TypeScript word arrays per language. Deterministic daily word selection via date-seeded shuffle. localStorage for quiz results and language preference. Dynamic routing: `/` → home, `/[lang]` → study, `/[lang]/quiz` → quiz, `/[lang]/quiz/result` → result.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Vitest, @testing-library/react, jsdom, Web Speech API (TTS), localStorage

## Global Constraints

- Language type: `"en" | "es" | "pt"` (exact union string type)
- TTS lang codes: `en-US` (English), `es-ES` (Spanish), `pt-BR` (Portuguese)
- Words per language: exactly 30 in data files
- Words per day: exactly 10 (deterministic by date hash)
- Quiz questions: exactly 10
- Options per question: exactly 4
- Question types: `"meaning-choice" | "word-choice" | "fill-blank"` (exact)
- Same language + same date → same 10 words always
- localStorage key for result: `word-quiz-result-{lang}-{date}` (e.g., `word-quiz-result-en-2026-06-22`)
- localStorage key for language: `word-quiz-language`
- Date format: `YYYY-MM-DD`
- Valid lang URL params: `en`, `es`, `pt` — invalid → redirect to `/`
- All UI text in Korean; English/Spanish/Portuguese only for word content
- Responsive: mobile-first, works on ≥320px width

---

## File Structure

```
word_quiz/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.ts
├── vitest.config.ts
├── src/
│   ├── test/
│   │   └── setup.ts
│   ├── app/
│   │   ├── layout.tsx          # root layout, sets Korean font + metadata
│   │   ├── globals.css         # Tailwind directives + base styles
│   │   ├── page.tsx            # Home: language selection
│   │   └── [lang]/
│   │       ├── page.tsx        # Study: word cards + progress + quiz button
│   │       └── quiz/
│   │           ├── page.tsx    # Quiz: 10 questions one at a time
│   │           └── result/
│   │               └── page.tsx # Result: score, wrong words, navigation
│   ├── data/
│   │   ├── words-en.ts         # 30 English Word objects
│   │   ├── words-es.ts         # 30 Spanish Word objects
│   │   ├── words-pt.ts         # 30 Portuguese Word objects
│   │   └── index.ts            # allWords: Record<Language, Word[]>
│   ├── lib/
│   │   ├── types.ts            # Word, QuizQuestion, QuizResult, Language types
│   │   ├── words.ts            # getTodayWords, shuffleArray, hashString
│   │   ├── quiz.ts             # generateQuiz, buildQuestion
│   │   ├── tts.ts              # speakText, isTTSSupported, langCode
│   │   └── storage.ts          # saveQuizResult, getQuizResult
│   └── components/
│       ├── WordCard.tsx         # Single word display card with TTS buttons
│       ├── ProgressBar.tsx      # Visual progress bar with label
│       └── QuizQuestion.tsx     # Question + 4 options + feedback display
```

---

### Task 1: Project Bootstrap

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts` (via create-next-app)
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json` (add test script)

**Interfaces:**
- Produces: working `npm run dev`, `npm test`, directory structure matching File Structure above

- [ ] **Step 1: Initialize Next.js project**

Run from `/Users/gilwon/dev/word_quiz`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --yes
```
Expected: creates `src/app/`, `tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, `package.json`

- [ ] **Step 2: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 4: Create test setup file**

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Create directories**

```bash
mkdir -p src/data src/lib src/components src/app/\[lang\]/quiz/result
```

- [ ] **Step 7: Initialize git**

```bash
git init
git add -A
git commit -m "chore: bootstrap Next.js project with Tailwind and Vitest"
```
Expected: initial commit on main branch

---

### Task 2: Types & Word Data

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/data/words-en.ts`
- Create: `src/data/words-es.ts`
- Create: `src/data/words-pt.ts`
- Create: `src/data/index.ts`

**Interfaces:**
- Produces:
  - `Language` type: `"en" | "es" | "pt"`
  - `Word` interface with fields: `id`, `language`, `word`, `meaningKo`, `partOfSpeech`, `explanationKo`, `example`, `exampleKo`
  - `QuizQuestion` interface
  - `QuizResult` interface
  - `allWords: Record<Language, Word[]>` exported from `src/data/index.ts`
  - `LANG_NAMES: Record<Language, string>` mapping to Korean names
  - `TTS_LANG_CODES: Record<Language, string>` mapping to TTS codes

- [ ] **Step 1: Write failing test for types**

Create `src/lib/types.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { allWords } from '@/data/index';
import type { Language } from '@/lib/types';

describe('word data', () => {
  const langs: Language[] = ['en', 'es', 'pt'];

  langs.forEach((lang) => {
    it(`${lang} has at least 30 words`, () => {
      expect(allWords[lang].length).toBeGreaterThanOrEqual(30);
    });

    it(`${lang} words have all required fields`, () => {
      allWords[lang].forEach((word) => {
        expect(word.id).toBeTruthy();
        expect(word.language).toBe(lang);
        expect(word.word).toBeTruthy();
        expect(word.meaningKo).toBeTruthy();
        expect(word.partOfSpeech).toBeTruthy();
        expect(word.explanationKo).toBeTruthy();
        expect(word.example).toBeTruthy();
        expect(word.exampleKo).toBeTruthy();
      });
    });

    it(`${lang} word ids are unique`, () => {
      const ids = allWords[lang].map((w) => w.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/lib/types.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Create types file**

Create `src/lib/types.ts`:
```typescript
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
```

- [ ] **Step 4: Create English word data**

Create `src/data/words-en.ts`:
```typescript
import type { Word } from '@/lib/types';

export const wordsEn: Word[] = [
  {
    id: "en-001",
    language: "en",
    word: "serendipity",
    meaningKo: "우연한 행운",
    partOfSpeech: "명사",
    explanationKo: "예상치 못하게 좋은 것을 우연히 발견하는 행운",
    example: "Finding that café was pure serendipity.",
    exampleKo: "그 카페를 찾은 것은 순전한 우연한 행운이었다.",
  },
  {
    id: "en-002",
    language: "en",
    word: "eloquent",
    meaningKo: "웅변적인",
    partOfSpeech: "형용사",
    explanationKo: "생각을 명확하고 설득력 있게 표현하는",
    example: "She gave an eloquent speech at the ceremony.",
    exampleKo: "그녀는 행사에서 웅변적인 연설을 했다.",
  },
  {
    id: "en-003",
    language: "en",
    word: "persevere",
    meaningKo: "인내하다",
    partOfSpeech: "동사",
    explanationKo: "어려움이 있어도 계속해서 노력하다",
    example: "You must persevere through every challenge.",
    exampleKo: "모든 어려움을 극복하며 인내해야 한다.",
  },
  {
    id: "en-004",
    language: "en",
    word: "ambiguous",
    meaningKo: "모호한",
    partOfSpeech: "형용사",
    explanationKo: "여러 가지로 해석될 수 있어 불분명한",
    example: "The instructions were ambiguous and confusing.",
    exampleKo: "지침이 모호하고 혼란스러웠다.",
  },
  {
    id: "en-005",
    language: "en",
    word: "benevolent",
    meaningKo: "자애로운",
    partOfSpeech: "형용사",
    explanationKo: "다른 사람을 친절하게 대하고 베푸는",
    example: "The benevolent king helped his people generously.",
    exampleKo: "자애로운 왕은 백성들을 너그럽게 도왔다.",
  },
  {
    id: "en-006",
    language: "en",
    word: "diligent",
    meaningKo: "근면한",
    partOfSpeech: "형용사",
    explanationKo: "꾸준히 열심히 일하거나 공부하는",
    example: "She is a diligent student who never gives up.",
    exampleKo: "그녀는 절대 포기하지 않는 근면한 학생이다.",
  },
  {
    id: "en-007",
    language: "en",
    word: "flourish",
    meaningKo: "번성하다",
    partOfSpeech: "동사",
    explanationKo: "건강하게 잘 성장하고 발전하다",
    example: "Flowers flourish in warm spring weather.",
    exampleKo: "꽃은 따뜻한 봄 날씨에 번성한다.",
  },
  {
    id: "en-008",
    language: "en",
    word: "gratitude",
    meaningKo: "감사",
    partOfSpeech: "명사",
    explanationKo: "누군가에게 고마움을 느끼는 마음",
    example: "She expressed her gratitude with a warm smile.",
    exampleKo: "그녀는 따뜻한 미소로 감사를 표했다.",
  },
  {
    id: "en-009",
    language: "en",
    word: "harmony",
    meaningKo: "조화",
    partOfSpeech: "명사",
    explanationKo: "서로 다른 요소들이 잘 어우러지는 상태",
    example: "They lived in harmony with nature.",
    exampleKo: "그들은 자연과 조화를 이루며 살았다.",
  },
  {
    id: "en-010",
    language: "en",
    word: "illuminate",
    meaningKo: "밝히다",
    partOfSpeech: "동사",
    explanationKo: "빛으로 밝게 하거나 이해를 돕다",
    example: "Candles illuminate the dark room beautifully.",
    exampleKo: "촛불이 어두운 방을 아름답게 밝힌다.",
  },
  {
    id: "en-011",
    language: "en",
    word: "jubilant",
    meaningKo: "기쁨에 넘치는",
    partOfSpeech: "형용사",
    explanationKo: "매우 행복하고 흥분된 상태인",
    example: "The team was jubilant after winning the championship.",
    exampleKo: "팀은 챔피언십 우승 후 기쁨에 넘쳤다.",
  },
  {
    id: "en-012",
    language: "en",
    word: "meticulous",
    meaningKo: "꼼꼼한",
    partOfSpeech: "형용사",
    explanationKo: "모든 세부 사항에 세심하게 주의를 기울이는",
    example: "He is meticulous about every small detail.",
    exampleKo: "그는 모든 작은 세부 사항에 꼼꼼하다.",
  },
  {
    id: "en-013",
    language: "en",
    word: "navigate",
    meaningKo: "탐색하다",
    partOfSpeech: "동사",
    explanationKo: "방향을 찾아 이동하거나 복잡한 상황을 헤쳐나가다",
    example: "He managed to navigate through the dense forest.",
    exampleKo: "그는 빽빽한 숲을 헤쳐나가는 데 성공했다.",
  },
  {
    id: "en-014",
    language: "en",
    word: "optimistic",
    meaningKo: "낙관적인",
    partOfSpeech: "형용사",
    explanationKo: "미래가 좋을 것이라고 긍정적으로 생각하는",
    example: "She remains optimistic despite the difficulties.",
    exampleKo: "그녀는 어려움에도 불구하고 낙관적인 태도를 유지한다.",
  },
  {
    id: "en-015",
    language: "en",
    word: "ponder",
    meaningKo: "곰곰이 생각하다",
    partOfSpeech: "동사",
    explanationKo: "어떤 문제나 질문에 대해 오래 깊이 생각하다",
    example: "He sat quietly to ponder the difficult question.",
    exampleKo: "그는 어려운 질문을 곰곰이 생각하기 위해 조용히 앉았다.",
  },
  {
    id: "en-016",
    language: "en",
    word: "resilient",
    meaningKo: "회복력 있는",
    partOfSpeech: "형용사",
    explanationKo: "어려운 상황에서 빠르게 회복하는 능력이 있는",
    example: "Children are often more resilient than adults.",
    exampleKo: "아이들은 종종 어른보다 더 회복력이 있다.",
  },
  {
    id: "en-017",
    language: "en",
    word: "sincere",
    meaningKo: "진실된",
    partOfSpeech: "형용사",
    explanationKo: "진심을 담아 솔직하게 표현하는",
    example: "She gave a sincere apology to everyone.",
    exampleKo: "그녀는 모두에게 진실된 사과를 했다.",
  },
  {
    id: "en-018",
    language: "en",
    word: "tranquil",
    meaningKo: "고요한",
    partOfSpeech: "형용사",
    explanationKo: "평화롭고 매우 조용한",
    example: "The lake was tranquil at dawn.",
    exampleKo: "새벽의 호수는 고요했다.",
  },
  {
    id: "en-019",
    language: "en",
    word: "vivid",
    meaningKo: "생생한",
    partOfSpeech: "형용사",
    explanationKo: "강렬하고 선명하여 실제처럼 느껴지는",
    example: "She had vivid memories of her childhood.",
    exampleKo: "그녀는 어린 시절의 생생한 기억을 가지고 있었다.",
  },
  {
    id: "en-020",
    language: "en",
    word: "wisdom",
    meaningKo: "지혜",
    partOfSpeech: "명사",
    explanationKo: "경험과 지식으로 쌓인 깊은 이해와 판단력",
    example: "Age and experience bring wisdom.",
    exampleKo: "나이와 경험은 지혜를 가져다준다.",
  },
  {
    id: "en-021",
    language: "en",
    word: "zealous",
    meaningKo: "열정적인",
    partOfSpeech: "형용사",
    explanationKo: "어떤 일에 강한 열정과 헌신을 보이는",
    example: "She is zealous in her pursuit of knowledge.",
    exampleKo: "그녀는 지식 추구에 열정적이다.",
  },
  {
    id: "en-022",
    language: "en",
    word: "abundant",
    meaningKo: "풍부한",
    partOfSpeech: "형용사",
    explanationKo: "필요 이상으로 매우 많은",
    example: "The region has abundant natural resources.",
    exampleKo: "그 지역에는 풍부한 천연자원이 있다.",
  },
  {
    id: "en-023",
    language: "en",
    word: "cherish",
    meaningKo: "소중히 여기다",
    partOfSpeech: "동사",
    explanationKo: "무언가를 매우 소중하게 생각하고 보호하다",
    example: "I will always cherish this memory.",
    exampleKo: "나는 이 기억을 항상 소중히 여길 것이다.",
  },
  {
    id: "en-024",
    language: "en",
    word: "dedicate",
    meaningKo: "헌신하다",
    partOfSpeech: "동사",
    explanationKo: "시간과 노력을 어떤 목표에 쏟아붓다",
    example: "He dedicated his life to helping others.",
    exampleKo: "그는 다른 사람을 돕는 데 삶을 헌신했다.",
  },
  {
    id: "en-025",
    language: "en",
    word: "empathy",
    meaningKo: "공감",
    partOfSpeech: "명사",
    explanationKo: "다른 사람의 감정을 이해하고 함께 느끼는 능력",
    example: "Empathy is the key to understanding others.",
    exampleKo: "공감은 다른 사람을 이해하는 열쇠이다.",
  },
  {
    id: "en-026",
    language: "en",
    word: "linger",
    meaningKo: "오래 머물다",
    partOfSpeech: "동사",
    explanationKo: "한 장소나 상태에 오랫동안 머물다",
    example: "The sweet scent began to linger in the room.",
    exampleKo: "달콤한 향기가 방에 오래 머물기 시작했다.",
  },
  {
    id: "en-027",
    language: "en",
    word: "knowledgeable",
    meaningKo: "박식한",
    partOfSpeech: "형용사",
    explanationKo: "특정 주제에 대해 많은 것을 알고 있는",
    example: "She is very knowledgeable about world history.",
    exampleKo: "그녀는 세계 역사에 대해 매우 박식하다.",
  },
  {
    id: "en-028",
    language: "en",
    word: "yearning",
    meaningKo: "갈망",
    partOfSpeech: "명사",
    explanationKo: "무언가를 깊이 바라는 간절한 마음",
    example: "He felt a deep yearning for his homeland.",
    exampleKo: "그는 고향에 대한 깊은 갈망을 느꼈다.",
  },
  {
    id: "en-029",
    language: "en",
    word: "unique",
    meaningKo: "독특한",
    partOfSpeech: "형용사",
    explanationKo: "다른 것들과 달리 하나뿐인 특별한",
    example: "Everyone has a unique personality and style.",
    exampleKo: "모든 사람은 독특한 성격과 스타일을 가지고 있다.",
  },
  {
    id: "en-030",
    language: "en",
    word: "inspire",
    meaningKo: "영감을 주다",
    partOfSpeech: "동사",
    explanationKo: "창의적이거나 긍정적인 느낌이나 생각을 불러일으키다",
    example: "Her story continues to inspire many people.",
    exampleKo: "그녀의 이야기는 많은 사람들에게 계속 영감을 준다.",
  },
];
```

- [ ] **Step 5: Create Spanish word data**

Create `src/data/words-es.ts`:
```typescript
import type { Word } from '@/lib/types';

export const wordsEs: Word[] = [
  {
    id: "es-001",
    language: "es",
    word: "alegría",
    meaningKo: "기쁨",
    partOfSpeech: "명사",
    explanationKo: "행복하고 기쁜 감정 상태",
    example: "La alegría de los niños es contagiosa.",
    exampleKo: "아이들의 기쁨은 전염성이 있다.",
  },
  {
    id: "es-002",
    language: "es",
    word: "bondad",
    meaningKo: "친절함",
    partOfSpeech: "명사",
    explanationKo: "선하고 친절한 성품이나 행동",
    example: "Su bondad nos conmovió profundamente.",
    exampleKo: "그의 친절함이 우리를 깊이 감동시켰다.",
  },
  {
    id: "es-003",
    language: "es",
    word: "caminar",
    meaningKo: "걷다",
    partOfSpeech: "동사",
    explanationKo: "발로 한 걸음씩 이동하다",
    example: "Me gusta caminar por el parque cada mañana.",
    exampleKo: "나는 매일 아침 공원을 걷는 것을 좋아한다.",
  },
  {
    id: "es-004",
    language: "es",
    word: "descansar",
    meaningKo: "쉬다",
    partOfSpeech: "동사",
    explanationKo: "피로를 회복하기 위해 활동을 멈추다",
    example: "Necesito descansar un poco después del trabajo.",
    exampleKo: "일이 끝난 후 좀 쉬어야 한다.",
  },
  {
    id: "es-005",
    language: "es",
    word: "esperar",
    meaningKo: "기다리다",
    partOfSpeech: "동사",
    explanationKo: "무언가가 오거나 일어나기를 기다리다",
    example: "Voy a esperar aquí hasta que llegues.",
    exampleKo: "네가 도착할 때까지 여기서 기다릴게.",
  },
  {
    id: "es-006",
    language: "es",
    word: "felicidad",
    meaningKo: "행복",
    partOfSpeech: "명사",
    explanationKo: "삶에서 만족과 기쁨을 느끼는 상태",
    example: "La felicidad está en las pequeñas cosas.",
    exampleKo: "행복은 작은 것에 있다.",
  },
  {
    id: "es-007",
    language: "es",
    word: "hermoso",
    meaningKo: "아름다운",
    partOfSpeech: "형용사",
    explanationKo: "보기에 매우 아름답고 매력적인",
    example: "El paisaje de la montaña es hermoso.",
    exampleKo: "산의 풍경이 아름답다.",
  },
  {
    id: "es-008",
    language: "es",
    word: "importante",
    meaningKo: "중요한",
    partOfSpeech: "형용사",
    explanationKo: "큰 가치나 의미를 가지고 있는",
    example: "Es importante estudiar todos los días.",
    exampleKo: "매일 공부하는 것이 중요하다.",
  },
  {
    id: "es-009",
    language: "es",
    word: "jugar",
    meaningKo: "놀다",
    partOfSpeech: "동사",
    explanationKo: "즐겁게 놀거나 경기를 하다",
    example: "Los niños juegan en el parque cada tarde.",
    exampleKo: "아이들은 매일 오후 공원에서 논다.",
  },
  {
    id: "es-010",
    language: "es",
    word: "libertad",
    meaningKo: "자유",
    partOfSpeech: "명사",
    explanationKo: "원하는 대로 행동하거나 생각할 수 있는 권리",
    example: "La libertad es un derecho fundamental.",
    exampleKo: "자유는 기본적인 권리이다.",
  },
  {
    id: "es-011",
    language: "es",
    word: "maravilloso",
    meaningKo: "놀라운",
    partOfSpeech: "형용사",
    explanationKo: "매우 인상적이고 감탄스러운",
    example: "Fue un viaje maravilloso lleno de aventuras.",
    exampleKo: "모험으로 가득한 놀라운 여행이었다.",
  },
  {
    id: "es-012",
    language: "es",
    word: "naturaleza",
    meaningKo: "자연",
    partOfSpeech: "명사",
    explanationKo: "동식물과 지구의 자연 환경",
    example: "Me encanta pasar tiempo en la naturaleza.",
    exampleKo: "나는 자연 속에서 시간을 보내는 것을 좋아한다.",
  },
  {
    id: "es-013",
    language: "es",
    word: "paciencia",
    meaningKo: "인내심",
    partOfSpeech: "명사",
    explanationKo: "어려운 상황을 평온하게 견디는 능력",
    example: "Necesitas paciencia para aprender un idioma.",
    exampleKo: "언어를 배우려면 인내심이 필요하다.",
  },
  {
    id: "es-014",
    language: "es",
    word: "recordar",
    meaningKo: "기억하다",
    partOfSpeech: "동사",
    explanationKo: "과거의 것을 마음속에서 다시 떠올리다",
    example: "Siempre recordar ese hermoso momento.",
    exampleKo: "나는 그 아름다운 순간을 항상 기억할 것이다.",
  },
  {
    id: "es-015",
    language: "es",
    word: "sueño",
    meaningKo: "꿈",
    partOfSpeech: "명사",
    explanationKo: "자는 동안 꾸는 꿈 또는 미래의 희망",
    example: "Tuve un sueño muy hermoso anoche.",
    exampleKo: "어젯밤 매우 아름다운 꿈을 꿨다.",
  },
  {
    id: "es-016",
    language: "es",
    word: "tranquilo",
    meaningKo: "조용한",
    partOfSpeech: "형용사",
    explanationKo: "평화롭고 아무런 소란이 없는",
    example: "Este lugar es muy tranquilo y relajante.",
    exampleKo: "이 곳은 매우 조용하고 편안하다.",
  },
  {
    id: "es-017",
    language: "es",
    word: "valiente",
    meaningKo: "용감한",
    partOfSpeech: "형용사",
    explanationKo: "위험을 두려워하지 않고 맞서는",
    example: "El bombero es valiente y siempre ayuda.",
    exampleKo: "소방관은 용감하고 항상 도움을 준다.",
  },
  {
    id: "es-018",
    language: "es",
    word: "aprender",
    meaningKo: "배우다",
    partOfSpeech: "동사",
    explanationKo: "공부나 경험을 통해 새로운 것을 알게 되다",
    example: "Me encanta aprender nuevos idiomas.",
    exampleKo: "나는 새로운 언어를 배우는 것을 좋아한다.",
  },
  {
    id: "es-019",
    language: "es",
    word: "brillante",
    meaningKo: "빛나는",
    partOfSpeech: "형용사",
    explanationKo: "밝게 빛나거나 매우 뛰어난 능력을 가진",
    example: "Tiene una mente brillante para las matemáticas.",
    exampleKo: "그는 수학에서 빛나는 두뇌를 가지고 있다.",
  },
  {
    id: "es-020",
    language: "es",
    word: "disfrutar",
    meaningKo: "즐기다",
    partOfSpeech: "동사",
    explanationKo: "기쁨과 즐거움을 느끼다",
    example: "Me gusta disfrutar de la música clásica.",
    exampleKo: "나는 클래식 음악을 즐기는 것을 좋아한다.",
  },
  {
    id: "es-021",
    language: "es",
    word: "energía",
    meaningKo: "에너지",
    partOfSpeech: "명사",
    explanationKo: "활동하는 데 필요한 힘과 활력",
    example: "Los niños tienen mucha energía para jugar.",
    exampleKo: "아이들은 놀기 위한 에너지가 넘친다.",
  },
  {
    id: "es-022",
    language: "es",
    word: "generoso",
    meaningKo: "관대한",
    partOfSpeech: "형용사",
    explanationKo: "아낌없이 베풀고 주는",
    example: "Es una persona muy generosa con todos.",
    exampleKo: "그는 모두에게 매우 관대한 사람이다.",
  },
  {
    id: "es-023",
    language: "es",
    word: "honesto",
    meaningKo: "정직한",
    partOfSpeech: "형용사",
    explanationKo: "거짓 없이 진실되고 도덕적인",
    example: "Sé honesto con tus propios sentimientos.",
    exampleKo: "자신의 감정에 정직해라.",
  },
  {
    id: "es-024",
    language: "es",
    word: "conocer",
    meaningKo: "알다",
    partOfSpeech: "동사",
    explanationKo: "누군가를 알거나 어떤 장소를 방문하다",
    example: "Me gustaría conocer nuevas personas.",
    exampleKo: "나는 새로운 사람들을 알고 싶다.",
  },
  {
    id: "es-025",
    language: "es",
    word: "cuidar",
    meaningKo: "돌보다",
    partOfSpeech: "동사",
    explanationKo: "누군가나 무언가를 보살피고 관리하다",
    example: "Debemos cuidar el medio ambiente.",
    exampleKo: "우리는 환경을 돌봐야 한다.",
  },
  {
    id: "es-026",
    language: "es",
    word: "fuerza",
    meaningKo: "힘",
    partOfSpeech: "명사",
    explanationKo: "신체적 또는 정신적인 힘과 능력",
    example: "Necesitas fuerza para superar los obstáculos.",
    exampleKo: "장애물을 극복하려면 힘이 필요하다.",
  },
  {
    id: "es-027",
    language: "es",
    word: "olvidar",
    meaningKo: "잊다",
    partOfSpeech: "동사",
    explanationKo: "기억에서 사라지거나 기억하지 못하다",
    example: "No puedo olvidar ese día tan especial.",
    exampleKo: "그 특별했던 날을 잊을 수 없다.",
  },
  {
    id: "es-028",
    language: "es",
    word: "querer",
    meaningKo: "사랑하다",
    partOfSpeech: "동사",
    explanationKo: "누군가를 깊이 사랑하거나 무언가를 원하다",
    example: "Te quiero mucho, más que a nada.",
    exampleKo: "무엇보다 너를 많이 사랑해.",
  },
  {
    id: "es-029",
    language: "es",
    word: "único",
    meaningKo: "유일한",
    partOfSpeech: "형용사",
    explanationKo: "세상에서 오직 하나뿐인 특별한",
    example: "Eres único en este mundo tan grande.",
    exampleKo: "넌 이 넓은 세상에서 유일한 존재야.",
  },
  {
    id: "es-030",
    language: "es",
    word: "crecer",
    meaningKo: "성장하다",
    partOfSpeech: "동사",
    explanationKo: "크기나 능력이 점점 커지고 발전하다",
    example: "Los niños crecen muy rápido.",
    exampleKo: "아이들은 매우 빠르게 성장한다.",
  },
];
```

- [ ] **Step 6: Create Portuguese word data**

Create `src/data/words-pt.ts`:
```typescript
import type { Word } from '@/lib/types';

export const wordsPt: Word[] = [
  {
    id: "pt-001",
    language: "pt",
    word: "alegria",
    meaningKo: "기쁨",
    partOfSpeech: "명사",
    explanationKo: "행복하고 기쁜 감정",
    example: "A alegria dela é muito contagiante.",
    exampleKo: "그녀의 기쁨은 매우 전염성이 있다.",
  },
  {
    id: "pt-002",
    language: "pt",
    word: "bonito",
    meaningKo: "아름다운",
    partOfSpeech: "형용사",
    explanationKo: "외모나 모습이 매력적이고 아름다운",
    example: "O jardim da casa é muito bonito.",
    exampleKo: "집 정원이 매우 아름답다.",
  },
  {
    id: "pt-003",
    language: "pt",
    word: "caminhar",
    meaningKo: "걷다",
    partOfSpeech: "동사",
    explanationKo: "발로 천천히 이동하다",
    example: "Gosto de caminhar pela praia ao pôr do sol.",
    exampleKo: "나는 일몰 때 해변을 걷는 것을 좋아한다.",
  },
  {
    id: "pt-004",
    language: "pt",
    word: "descansar",
    meaningKo: "쉬다",
    partOfSpeech: "동사",
    explanationKo: "피로를 풀기 위해 쉬다",
    example: "Preciso descansar depois de um longo dia.",
    exampleKo: "긴 하루가 끝난 후 쉬어야 한다.",
  },
  {
    id: "pt-005",
    language: "pt",
    word: "esperança",
    meaningKo: "희망",
    partOfSpeech: "명사",
    explanationKo: "좋은 일이 일어나기를 바라는 마음",
    example: "A esperança é a última que morre.",
    exampleKo: "희망은 마지막에 죽는다.",
  },
  {
    id: "pt-006",
    language: "pt",
    word: "felicidade",
    meaningKo: "행복",
    partOfSpeech: "명사",
    explanationKo: "삶에서 기쁨과 만족을 느끼는 상태",
    example: "A felicidade está nas pequenas coisas.",
    exampleKo: "행복은 작은 것에 있다.",
  },
  {
    id: "pt-007",
    language: "pt",
    word: "humilde",
    meaningKo: "겸손한",
    partOfSpeech: "형용사",
    explanationKo: "자신을 낮추고 다른 사람을 존중하는",
    example: "Ele é uma pessoa muito humilde e gentil.",
    exampleKo: "그는 매우 겸손하고 친절한 사람이다.",
  },
  {
    id: "pt-008",
    language: "pt",
    word: "importante",
    meaningKo: "중요한",
    partOfSpeech: "형용사",
    explanationKo: "큰 가치나 의미를 가지고 있는",
    example: "É importante ser honesto com os outros.",
    exampleKo: "다른 사람들에게 정직한 것이 중요하다.",
  },
  {
    id: "pt-009",
    language: "pt",
    word: "jogar",
    meaningKo: "놀다",
    partOfSpeech: "동사",
    explanationKo: "즐겁게 놀거나 스포츠를 하다",
    example: "As crianças adoram jogar na rua.",
    exampleKo: "아이들은 거리에서 노는 것을 매우 좋아한다.",
  },
  {
    id: "pt-010",
    language: "pt",
    word: "liberdade",
    meaningKo: "자유",
    partOfSpeech: "명사",
    explanationKo: "원하는 대로 살고 행동할 권리",
    example: "A liberdade é um direito precioso.",
    exampleKo: "자유는 소중한 권리이다.",
  },
  {
    id: "pt-011",
    language: "pt",
    word: "maravilhoso",
    meaningKo: "놀라운",
    partOfSpeech: "형용사",
    explanationKo: "매우 감동적이고 훌륭한",
    example: "Foi uma experiência maravilhosa e inesquecível.",
    exampleKo: "잊을 수 없는 놀라운 경험이었다.",
  },
  {
    id: "pt-012",
    language: "pt",
    word: "natureza",
    meaningKo: "자연",
    partOfSpeech: "명사",
    explanationKo: "동식물과 지구의 자연 환경",
    example: "A natureza do Brasil é incrível.",
    exampleKo: "브라질의 자연은 놀랍다.",
  },
  {
    id: "pt-013",
    language: "pt",
    word: "paciência",
    meaningKo: "인내심",
    partOfSpeech: "명사",
    explanationKo: "어려운 상황을 차분하게 견디는 능력",
    example: "Tenha paciência, as coisas vão melhorar.",
    exampleKo: "인내심을 가지세요, 상황이 나아질 거예요.",
  },
  {
    id: "pt-014",
    language: "pt",
    word: "lembrar",
    meaningKo: "기억하다",
    partOfSpeech: "동사",
    explanationKo: "과거의 것을 마음속에서 떠올리다",
    example: "Sempre vou lembrar desse momento especial.",
    exampleKo: "나는 이 특별한 순간을 항상 기억할 것이다.",
  },
  {
    id: "pt-015",
    language: "pt",
    word: "sonho",
    meaningKo: "꿈",
    partOfSpeech: "명사",
    explanationKo: "잘 때 꾸는 꿈 또는 미래에 대한 희망",
    example: "Tive um sonho muito bonito ontem.",
    exampleKo: "어제 매우 아름다운 꿈을 꿨다.",
  },
  {
    id: "pt-016",
    language: "pt",
    word: "tranquilo",
    meaningKo: "조용한",
    partOfSpeech: "형용사",
    explanationKo: "평화롭고 소란스럽지 않은",
    example: "Este lugar é muito tranquilo e agradável.",
    exampleKo: "이 곳은 매우 조용하고 쾌적하다.",
  },
  {
    id: "pt-017",
    language: "pt",
    word: "valente",
    meaningKo: "용감한",
    partOfSpeech: "형용사",
    explanationKo: "두려움 없이 어려운 상황을 맞서는",
    example: "Ele é muito valente e corajoso.",
    exampleKo: "그는 매우 용감하고 대담하다.",
  },
  {
    id: "pt-018",
    language: "pt",
    word: "aprender",
    meaningKo: "배우다",
    partOfSpeech: "동사",
    explanationKo: "공부나 경험으로 새로운 것을 익히다",
    example: "Adoro aprender coisas novas todos os dias.",
    exampleKo: "나는 매일 새로운 것을 배우는 것을 좋아한다.",
  },
  {
    id: "pt-019",
    language: "pt",
    word: "brilhante",
    meaningKo: "빛나는",
    partOfSpeech: "형용사",
    explanationKo: "밝게 빛나거나 뛰어난 능력을 가진",
    example: "Ele tem uma mente brilhante para a ciência.",
    exampleKo: "그는 과학에 빛나는 두뇌를 가지고 있다.",
  },
  {
    id: "pt-020",
    language: "pt",
    word: "desfrutar",
    meaningKo: "즐기다",
    partOfSpeech: "동사",
    explanationKo: "기쁨과 즐거움을 충분히 누리다",
    example: "Gosto de desfrutar da música ao ar livre.",
    exampleKo: "나는 야외에서 음악을 즐기는 것을 좋아한다.",
  },
  {
    id: "pt-021",
    language: "pt",
    word: "energia",
    meaningKo: "에너지",
    partOfSpeech: "명사",
    explanationKo: "활동하는 데 필요한 힘과 활력",
    example: "Ela tem muita energia para trabalhar.",
    exampleKo: "그녀는 일하기 위한 에너지가 넘친다.",
  },
  {
    id: "pt-022",
    language: "pt",
    word: "generoso",
    meaningKo: "관대한",
    partOfSpeech: "형용사",
    explanationKo: "아낌없이 베풀고 나누는",
    example: "Ela é uma pessoa muito generosa e bondosa.",
    exampleKo: "그녀는 매우 관대하고 친절한 사람이다.",
  },
  {
    id: "pt-023",
    language: "pt",
    word: "honesto",
    meaningKo: "정직한",
    partOfSpeech: "형용사",
    explanationKo: "거짓 없이 진실하고 도덕적인",
    example: "Seja honesto com você mesmo.",
    exampleKo: "자신에게 정직하세요.",
  },
  {
    id: "pt-024",
    language: "pt",
    word: "conhecer",
    meaningKo: "알다",
    partOfSpeech: "동사",
    explanationKo: "누군가를 알거나 어떤 장소에 가다",
    example: "Quero conhecer novos amigos interessantes.",
    exampleKo: "흥미로운 새 친구들을 사귀고 싶다.",
  },
  {
    id: "pt-025",
    language: "pt",
    word: "cuidar",
    meaningKo: "돌보다",
    partOfSpeech: "동사",
    explanationKo: "누군가나 무언가를 보살피고 관리하다",
    example: "Precisamos cuidar do nosso planeta.",
    exampleKo: "우리는 우리 행성을 돌봐야 한다.",
  },
  {
    id: "pt-026",
    language: "pt",
    word: "força",
    meaningKo: "힘",
    partOfSpeech: "명사",
    explanationKo: "신체적 또는 정신적 힘",
    example: "Você tem força para superar tudo isso.",
    exampleKo: "당신은 이 모든 것을 극복할 힘이 있다.",
  },
  {
    id: "pt-027",
    language: "pt",
    word: "esquecer",
    meaningKo: "잊다",
    partOfSpeech: "동사",
    explanationKo: "기억이 사라지거나 기억하지 못하다",
    example: "Não consigo esquecer esse dia especial.",
    exampleKo: "그 특별한 날을 잊을 수가 없다.",
  },
  {
    id: "pt-028",
    language: "pt",
    word: "querer",
    meaningKo: "원하다",
    partOfSpeech: "동사",
    explanationKo: "무언가를 원하거나 누군가를 사랑하다",
    example: "Quero ser feliz e saudável.",
    exampleKo: "행복하고 건강하고 싶다.",
  },
  {
    id: "pt-029",
    language: "pt",
    word: "único",
    meaningKo: "유일한",
    partOfSpeech: "형용사",
    explanationKo: "오직 하나뿐인 특별한",
    example: "Você é único neste mundo.",
    exampleKo: "당신은 이 세상에서 유일한 존재입니다.",
  },
  {
    id: "pt-030",
    language: "pt",
    word: "crescer",
    meaningKo: "성장하다",
    partOfSpeech: "동사",
    explanationKo: "크기나 능력이 발전하고 커지다",
    example: "As crianças crescem muito rápido.",
    exampleKo: "아이들은 매우 빠르게 성장한다.",
  },
];
```

- [ ] **Step 7: Create data barrel export**

Create `src/data/index.ts`:
```typescript
import type { Language, Word } from '@/lib/types';
import { wordsEn } from './words-en';
import { wordsEs } from './words-es';
import { wordsPt } from './words-pt';

export const allWords: Record<Language, Word[]> = {
  en: wordsEn,
  es: wordsEs,
  pt: wordsPt,
};

export { wordsEn, wordsEs, wordsPt };
```

- [ ] **Step 8: Run tests**

```bash
npm test -- src/lib/types.test.ts
```
Expected: PASS — 9 tests passing (3 langs × 3 assertions each)

- [ ] **Step 9: Commit**

```bash
git add src/lib/types.ts src/data/ src/lib/types.test.ts
git commit -m "feat: add types, word data for en/es/pt, and data barrel export"
```

---

### Task 3: Core Utilities

**Files:**
- Create: `src/lib/words.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/words.test.ts`
- Create: `src/lib/storage.test.ts`

**Interfaces:**
- Consumes:
  - `Language`, `Word`, `QuizResult` from `@/lib/types`
  - `allWords` from `@/data/index`
- Produces:
  - `shuffleArray<T>(array: T[], seed: number): T[]`
  - `hashString(str: string): number`
  - `getTodayWords(language: Language, date: string): Word[]` — returns exactly 10 words
  - `saveQuizResult(result: QuizResult): void`
  - `getQuizResult(language: Language, date: string): QuizResult | null`

- [ ] **Step 1: Write failing tests**

Create `src/lib/words.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { getTodayWords, shuffleArray, hashString } from '@/lib/words';
import { allWords } from '@/data/index';

describe('hashString', () => {
  it('returns same value for same input', () => {
    expect(hashString('test')).toBe(hashString('test'));
  });

  it('returns different value for different input', () => {
    expect(hashString('en-2026-06-22')).not.toBe(hashString('en-2026-06-23'));
  });

  it('returns non-negative number', () => {
    expect(hashString('any-string')).toBeGreaterThanOrEqual(0);
  });
});

describe('shuffleArray', () => {
  it('returns array with same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr, 42);
    expect(result).toHaveLength(5);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3];
    shuffleArray(arr, 1);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('returns same order for same seed', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr, 99)).toEqual(shuffleArray(arr, 99));
  });

  it('returns different order for different seeds', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = shuffleArray(arr, 1);
    const b = shuffleArray(arr, 2);
    expect(a).not.toEqual(b);
  });
});

describe('getTodayWords', () => {
  it('returns exactly 10 words', () => {
    const words = getTodayWords('en', '2026-06-22');
    expect(words).toHaveLength(10);
  });

  it('returns words of correct language', () => {
    const words = getTodayWords('es', '2026-06-22');
    words.forEach((w) => expect(w.language).toBe('es'));
  });

  it('returns same words for same date and language', () => {
    const a = getTodayWords('en', '2026-06-22');
    const b = getTodayWords('en', '2026-06-22');
    expect(a.map((w) => w.id)).toEqual(b.map((w) => w.id));
  });

  it('returns different words for different dates', () => {
    const a = getTodayWords('en', '2026-06-22');
    const b = getTodayWords('en', '2026-06-23');
    const aIds = a.map((w) => w.id).join(',');
    const bIds = b.map((w) => w.id).join(',');
    expect(aIds).not.toBe(bIds);
  });

  it('returns words that exist in full word list', () => {
    const words = getTodayWords('pt', '2026-06-22');
    const allPtIds = allWords.pt.map((w) => w.id);
    words.forEach((w) => expect(allPtIds).toContain(w.id));
  });
});
```

Create `src/lib/storage.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveQuizResult, getQuizResult } from '@/lib/storage';
import type { QuizResult } from '@/lib/types';

const mockResult: QuizResult = {
  language: 'en',
  date: '2026-06-22',
  correctCount: 7,
  scorePercent: 70,
  wrongWordIds: ['en-003', 'en-007', 'en-015'],
  completedAt: '2026-06-22T10:30:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
});

describe('saveQuizResult', () => {
  it('saves result to localStorage', () => {
    saveQuizResult(mockResult);
    const stored = localStorage.getItem('word-quiz-result-en-2026-06-22');
    expect(stored).not.toBeNull();
  });

  it('stored value parses to original result', () => {
    saveQuizResult(mockResult);
    const stored = localStorage.getItem('word-quiz-result-en-2026-06-22');
    expect(JSON.parse(stored!)).toEqual(mockResult);
  });
});

describe('getQuizResult', () => {
  it('returns null when no result saved', () => {
    expect(getQuizResult('en', '2026-06-22')).toBeNull();
  });

  it('returns saved result', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('en', '2026-06-22')).toEqual(mockResult);
  });

  it('returns null for different language', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('es', '2026-06-22')).toBeNull();
  });

  it('returns null for different date', () => {
    saveQuizResult(mockResult);
    expect(getQuizResult('en', '2026-06-23')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- src/lib/words.test.ts src/lib/storage.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement words.ts**

Create `src/lib/words.ts`:
```typescript
import type { Language, Word } from '@/lib/types';
import { allWords } from '@/data/index';

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function shuffleArray<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let s = seed;
  let currentIndex = arr.length;

  while (currentIndex !== 0) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const randomIndex = Math.abs(s) % currentIndex;
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}

export function getTodayWords(language: Language, date: string): Word[] {
  const words = allWords[language];
  const seed = hashString(`${language}-${date}`);
  const shuffled = shuffleArray(words, seed);
  return shuffled.slice(0, 10);
}
```

- [ ] **Step 4: Implement storage.ts**

Create `src/lib/storage.ts`:
```typescript
import type { Language, QuizResult } from '@/lib/types';

const resultKey = (lang: Language, date: string) =>
  `word-quiz-result-${lang}-${date}`;

export function saveQuizResult(result: QuizResult): void {
  localStorage.setItem(resultKey(result.language, result.date), JSON.stringify(result));
}

export function getQuizResult(language: Language, date: string): QuizResult | null {
  const stored = localStorage.getItem(resultKey(language, date));
  return stored ? (JSON.parse(stored) as QuizResult) : null;
}

export function getSavedLanguage(): string | null {
  return localStorage.getItem('word-quiz-language');
}

export function setSavedLanguage(language: Language): void {
  localStorage.setItem('word-quiz-language', language);
}
```

- [ ] **Step 5: Run tests**

```bash
npm test -- src/lib/words.test.ts src/lib/storage.test.ts
```
Expected: PASS — all tests green

- [ ] **Step 6: Commit**

```bash
git add src/lib/words.ts src/lib/storage.ts src/lib/words.test.ts src/lib/storage.test.ts
git commit -m "feat: add getTodayWords, shuffleArray, saveQuizResult, getQuizResult"
```

---

### Task 4: TTS & Quiz Generation

**Files:**
- Create: `src/lib/tts.ts`
- Create: `src/lib/quiz.ts`
- Create: `src/lib/quiz.test.ts`

**Interfaces:**
- Consumes:
  - `Language`, `Word`, `QuizQuestion`, `QuizType`, `TTS_LANG_CODES` from `@/lib/types`
  - `shuffleArray` from `@/lib/words`
  - `allWords` from `@/data/index`
- Produces:
  - `speakText(text: string, languageCode: string): boolean`
  - `isTTSSupported(): boolean`
  - `generateQuiz(todayWords: Word[], allWordsForLang: Word[]): QuizQuestion[]` — returns exactly 10

- [ ] **Step 1: Write failing quiz tests**

Create `src/lib/quiz.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateQuiz } from '@/lib/quiz';
import { getTodayWords } from '@/lib/words';
import { allWords } from '@/data/index';

describe('generateQuiz', () => {
  const todayWords = getTodayWords('en', '2026-06-22');
  const quiz = generateQuiz(todayWords, allWords['en']);

  it('generates exactly 10 questions', () => {
    expect(quiz).toHaveLength(10);
  });

  it('each question has exactly 4 options', () => {
    quiz.forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  it('correct answer is always in options', () => {
    quiz.forEach((q) => {
      expect(q.options).toContain(q.correctAnswer);
    });
  });

  it('all today words appear at least once', () => {
    const coveredWordIds = new Set(quiz.map((q) => q.wordId));
    todayWords.forEach((w) => {
      expect(coveredWordIds.has(w.id)).toBe(true);
    });
  });

  it('only uses valid question types', () => {
    const validTypes = ['meaning-choice', 'word-choice', 'fill-blank'];
    quiz.forEach((q) => {
      expect(validTypes).toContain(q.type);
    });
  });

  it('each question has a non-empty id', () => {
    quiz.forEach((q) => {
      expect(q.id).toBeTruthy();
    });
  });

  it('each question has a non-empty question text', () => {
    quiz.forEach((q) => {
      expect(q.question).toBeTruthy();
    });
  });

  it('options contain no duplicates per question', () => {
    quiz.forEach((q) => {
      const unique = new Set(q.options);
      expect(unique.size).toBe(4);
    });
  });

  it('generates different question order on repeated calls (randomness)', () => {
    const quiz2 = generateQuiz(todayWords, allWords['en']);
    const ids1 = quiz.map((q) => q.id).join(',');
    const ids2 = quiz2.map((q) => q.id).join(',');
    // This can occasionally be equal by chance, but with 10! possibilities it's effectively never
    // Run quiz2 generation multiple times if this is flaky in practice
    expect(ids1).not.toBe(ids2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/lib/quiz.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement tts.ts**

Create `src/lib/tts.ts`:
```typescript
export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text: string, languageCode: string): boolean {
  if (!isTTSSupported()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode;
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
  return true;
}
```

- [ ] **Step 4: Implement quiz.ts**

Create `src/lib/quiz.ts`:
```typescript
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
```

- [ ] **Step 5: Run tests**

```bash
npm test -- src/lib/quiz.test.ts
```
Expected: PASS — all tests green (note: the randomness test may occasionally fail; re-run once if it does)

- [ ] **Step 6: Commit**

```bash
git add src/lib/tts.ts src/lib/quiz.ts src/lib/quiz.test.ts
git commit -m "feat: add speakText TTS utility and generateQuiz with 3 question types"
```

---

### Task 5: UI Components

**Files:**
- Create: `src/components/WordCard.tsx`
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/QuizQuestion.tsx`

**Interfaces:**
- Consumes:
  - `Word`, `QuizQuestion`, `Language`, `TTS_LANG_CODES` from `@/lib/types`
  - `speakText`, `isTTSSupported` from `@/lib/tts`
- Produces:
  - `WordCard({ word, language }: { word: Word; language: Language })` — displays word card with TTS buttons
  - `ProgressBar({ current, total, label }: { current: number; total: number; label?: string })` — visual progress
  - `QuizQuestionCard({ question, onAnswer, answered }: { question: QuizQuestion; onAnswer: (answer: string) => void; answered: string | null })` — quiz question with options and feedback

- [ ] **Step 1: Create WordCard component**

Create `src/components/WordCard.tsx`:
```typescript
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold text-gray-900">{word.word}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {word.partOfSpeech}
            </span>
          </div>
          <p className="text-indigo-600 font-semibold mt-1">{word.meaningKo}</p>
        </div>
        {ttsSupported && (
          <button
            onClick={() => speakText(word.word, langCode)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
            aria-label={`${word.word} 발음 듣기`}
          >
            🔊
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3">{word.explanationKo}</p>

      <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 italic">"{word.example}"</p>
            <p className="text-xs text-gray-500 mt-1">{word.exampleKo}</p>
          </div>
          {ttsSupported && (
            <button
              onClick={() => speakText(word.example, langCode)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors text-xs"
              aria-label="예문 발음 듣기"
            >
              🔊
            </button>
          )}
        </div>
      </div>

      {!ttsSupported && (
        <p className="text-xs text-gray-400 mt-2">이 브라우저는 발음 기능을 지원하지 않습니다.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ProgressBar component**

Create `src/components/ProgressBar.tsx`:
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-semibold text-indigo-600">
            {current}/{total}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create QuizQuestionCard component**

Create `src/components/QuizQuestion.tsx`:
```typescript
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
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add WordCard, ProgressBar, QuizQuestionCard UI components"
```

---

### Task 6: App Layout & Home Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes:
  - `Language`, `LANG_NAMES`, `LANG_FLAGS` from `@/lib/types`
  - `getSavedLanguage`, `setSavedLanguage` from `@/lib/storage`
- Produces: Home page at `/` with language selection; clicking a language navigates to `/[lang]`

- [ ] **Step 1: Update root layout**

Replace content of `src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '단어 퀴즈 | 매일 외국어 학습',
  description: '영어, 스페인어, 포르투갈어 단어를 매일 학습하고 퀴즈로 확인하세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen antialiased">
        <main className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update globals.css**

Replace content of `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-gray-900;
  }
}
```

- [ ] **Step 3: Create home page**

Replace content of `src/app/page.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Language } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getSavedLanguage, setSavedLanguage } from '@/lib/storage';

const LANGUAGES: Language[] = ['en', 'es', 'pt'];

const LANG_DESCRIPTIONS: Record<Language, string> = {
  en: '영어 단어 학습',
  es: '스페인어 단어 학습',
  pt: '포르투갈어 단어 학습',
};

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const saved = getSavedLanguage();
    if (saved && LANGUAGES.includes(saved as Language)) {
      router.prefetch(`/${saved}`);
    }
  }, [router]);

  function handleLanguageSelect(lang: Language) {
    setSavedLanguage(lang);
    router.push(`/${lang}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 단어 퀴즈</h1>
        <p className="text-gray-500 text-base">
          매일 10개의 단어를 학습하고 퀴즈로 기억을 확인하세요
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wide">
          언어를 선택하세요
        </p>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageSelect(lang)}
            className="flex items-center gap-4 w-full bg-white rounded-2xl border-2 border-gray-100 px-6 py-4 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">{LANG_FLAGS[lang]}</span>
            <div className="text-left">
              <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {LANG_NAMES[lang]}
              </p>
              <p className="text-sm text-gray-400">{LANG_DESCRIPTIONS[lang]}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Run dev server briefly to verify home page renders**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | grep -c "단어 퀴즈" && kill %1
```
Expected: outputs 1 or more (page contains "단어 퀴즈")

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/app/page.tsx
git commit -m "feat: add root layout and home page with language selection"
```

---

### Task 7: Study Screen

**Files:**
- Create: `src/app/[lang]/page.tsx`

**Interfaces:**
- Consumes:
  - `Language`, `LANG_NAMES`, `LANG_FLAGS` from `@/lib/types`
  - `getTodayWords` from `@/lib/words`
  - `getQuizResult` from `@/lib/storage`
  - `WordCard` from `@/components/WordCard`
  - `ProgressBar` from `@/components/ProgressBar`
- Produces: Study page at `/en`, `/es`, `/pt` showing 10 word cards and a quiz button

Note: `params.lang` comes from Next.js App Router as `Promise<{ lang: string }>` in Next.js 14+. Use `React.use(params)` to unwrap. Redirect to `/` if lang is not `en`, `es`, or `pt`.

- [ ] **Step 1: Create study page**

Create `src/app/[lang]/page.tsx`:
```typescript
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, Word, QuizResult } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getTodayWords } from '@/lib/words';
import { getQuizResult } from '@/lib/storage';
import WordCard from '@/components/WordCard';
import ProgressBar from '@/components/ProgressBar';

const VALID_LANGS: Language[] = ['en', 'es', 'pt'];

function getTodayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function StudyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const today = getTodayDate();
    setDate(today);
    const todayWords = getTodayWords(lang as Language, today);
    setWords(todayWords);
    const quizResult = getQuizResult(lang as Language, today);
    setResult(quizResult);
  }, [lang, router]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  const language = lang as Language;

  const correctCount = result?.correctCount ?? 0;
  const totalQuestions = 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="홈으로"
        >
          ← 뒤로
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{LANG_FLAGS[language]}</span>
          <h1 className="text-xl font-bold text-gray-900">
            {LANG_NAMES[language]} 오늘의 단어
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <ProgressBar
          current={correctCount}
          total={totalQuestions}
          label={result ? `오늘 학습 진행률 (${date})` : `오늘의 단어 (${date})`}
        />
        {result && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            최근 시험 점수: {result.scorePercent}점 ({result.correctCount}/{totalQuestions})
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {words.map((word) => (
          <WordCard key={word.id} word={word} language={language} />
        ))}
      </div>

      {words.length === 0 && (
        <p className="text-center text-gray-400 py-8">단어를 불러오는 중...</p>
      )}

      <div className="sticky bottom-4">
        <button
          onClick={() => router.push(`/${lang}/quiz`)}
          disabled={words.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors disabled:opacity-50"
        >
          {result ? '다시 시험 보기 →' : '시험 보기 →'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/\[lang\]/page.tsx
git commit -m "feat: add study screen with word cards and quiz start button"
```

---

### Task 8: Quiz Screen

**Files:**
- Create: `src/app/[lang]/quiz/page.tsx`

**Interfaces:**
- Consumes:
  - `Language`, `QuizQuestion`, `LANG_NAMES` from `@/lib/types`
  - `getTodayWords` from `@/lib/words`
  - `generateQuiz` from `@/lib/quiz`
  - `allWords` from `@/data/index`
  - `saveQuizResult` from `@/lib/storage`
  - `QuizQuestionCard` from `@/components/QuizQuestion`
  - `ProgressBar` from `@/components/ProgressBar`
- Produces: Quiz page at `/[lang]/quiz`; on completion calls `saveQuizResult` and navigates to `/[lang]/quiz/result`

- [ ] **Step 1: Create quiz page**

Create `src/app/[lang]/quiz/page.tsx`:
```typescript
'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, QuizQuestion } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getTodayWords } from '@/lib/words';
import { generateQuiz } from '@/lib/quiz';
import { saveQuizResult } from '@/lib/storage';
import { allWords } from '@/data/index';
import QuizQuestionCard from '@/components/QuizQuestion';
import ProgressBar from '@/components/ProgressBar';

const VALID_LANGS: Language[] = ['en', 'es', 'pt'];

function getTodayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function QuizPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [wrongWordIds, setWrongWordIds] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const today = getTodayDate();
    setDate(today);
    const todayWords = getTodayWords(lang as Language, today);
    const quiz = generateQuiz(todayWords, allWords[lang as Language]);
    setQuestions(quiz);
  }, [lang, router]);

  const handleAnswer = useCallback(
    (answer: string) => {
      setAnswered(answer);
      const question = questions[currentIndex];
      if (answer === question.correctAnswer) {
        setCorrectCount((prev) => prev + 1);
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
      const finalCorrect =
        answered === questions[currentIndex].correctAnswer
          ? correctCount
          : correctCount;
      const total = questions.length;
      const scorePercent = Math.round((finalCorrect / total) * 100);
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
  }, [currentIndex, questions, answered, correctCount, wrongWordIds, lang, date, router]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">퀴즈를 준비하는 중...</p>
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
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="학습으로 돌아가기"
        >
          ← 뒤로
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{LANG_FLAGS[language]}</span>
          <span className="font-bold text-gray-900">{LANG_NAMES[language]} 퀴즈</span>
        </div>
      </div>

      <ProgressBar
        current={currentIndex + (answered ? 1 : 0)}
        total={questions.length}
        label={`문제 ${currentIndex + 1} / ${questions.length}`}
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "src/app/[lang]/quiz/page.tsx"
git commit -m "feat: add quiz screen with question-by-question flow and score tracking"
```

---

### Task 9: Result Screen

**Files:**
- Create: `src/app/[lang]/quiz/result/page.tsx`

**Interfaces:**
- Consumes:
  - `Language`, `LANG_NAMES`, `LANG_FLAGS`, `Word` from `@/lib/types`
  - `getQuizResult` from `@/lib/storage`
  - `getTodayWords` from `@/lib/words`
- Produces: Result page at `/[lang]/quiz/result`; shows score, correct count, wrong words, and navigation buttons

- [ ] **Step 1: Create result page**

Create `src/app/[lang]/quiz/result/page.tsx`:
```typescript
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, QuizResult, Word } from '@/lib/types';
import { LANG_NAMES, LANG_FLAGS } from '@/lib/types';
import { getQuizResult } from '@/lib/storage';
import { getTodayWords } from '@/lib/words';

const VALID_LANGS: Language[] = ['en', 'es', 'pt'];

function getTodayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getScoreEmoji(percent: number): string {
  if (percent === 100) return '🏆';
  if (percent >= 80) return '🌟';
  if (percent >= 60) return '👍';
  if (percent >= 40) return '📖';
  return '💪';
}

export default function ResultPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!VALID_LANGS.includes(lang as Language)) {
      router.replace('/');
      return;
    }
    const today = getTodayDate();
    const quizResult = getQuizResult(lang as Language, today);
    if (!quizResult) {
      router.replace(`/${lang}`);
      return;
    }
    setResult(quizResult);

    const todayWords = getTodayWords(lang as Language, today);
    const wrong = todayWords.filter((w) => quizResult.wrongWordIds.includes(w.id));
    setWrongWords(wrong);
  }, [lang, router]);

  if (!VALID_LANGS.includes(lang as Language)) return null;
  if (!result) return null;

  const language = lang as Language;
  const emoji = getScoreEmoji(result.scorePercent);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{LANG_FLAGS[language]}</span>
          <span className="font-bold text-gray-900">{LANG_NAMES[language]} 퀴즈 결과</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
        <div className="text-6xl mb-3">{emoji}</div>
        <div className="text-5xl font-bold text-indigo-600 mb-1">
          {result.scorePercent}점
        </div>
        <p className="text-gray-500 text-sm">
          {result.correctCount}개 정답 / {10}문제
        </p>

        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${result.scorePercent}%` }}
          />
        </div>
      </div>

      {wrongWords.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>❌</span> 틀린 단어 ({wrongWords.length}개)
          </h2>
          <div className="flex flex-col gap-2">
            {wrongWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3"
              >
                <span className="font-semibold text-gray-800">{word.word}</span>
                <span className="text-sm text-gray-500">{word.meaningKo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {wrongWords.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-green-700 font-semibold">🎉 완벽! 모든 문제를 맞혔습니다!</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push(`/${lang}/quiz`)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow transition-colors"
        >
          다시 시험 보기
        </button>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl border-2 border-gray-200 transition-colors"
        >
          오늘의 단어 보기
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors text-sm"
        >
          언어 변경
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Run full test suite**

```bash
npm test
```
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add "src/app/[lang]/quiz/result/page.tsx"
git commit -m "feat: add result screen with score, wrong words, and navigation"
```

---

## Self-Review

### Spec Coverage Check

| Requirement | Task |
|---|---|
| 언어 선택 (en/es/pt) | Task 6 (Home page) |
| 오늘의 단어 10개 | Task 3 (getTodayWords), Task 7 (Study screen) |
| 단어 카드 (단어/뜻/품사/설명/예문/예문번역) | Task 5 (WordCard) |
| 단어 발음 버튼 | Task 5 (WordCard), Task 4 (speakText) |
| 예문 발음 버튼 | Task 5 (WordCard) |
| 학습 진행률 바 | Task 5 (ProgressBar), Task 7 (Study screen) |
| 퀴즈 10문제 랜덤 | Task 4 (generateQuiz), Task 8 (Quiz screen) |
| 3가지 문제 유형 | Task 4 (generateQuiz) |
| 4지선다 | Task 4 (buildQuestion), Task 5 (QuizQuestionCard) |
| 각 단어 최소 1회 출제 | Task 4 (generateQuiz test) |
| 정답/오답 즉시 피드백 | Task 5 (QuizQuestionCard), Task 8 |
| 결과 화면 (점수/맞힌수/틀린단어) | Task 9 (Result screen) |
| 다시 시험/단어 보기 버튼 | Task 9 |
| localStorage 저장 | Task 3 (storage.ts) |
| 같은 날 같은 단어 | Task 3 (getTodayWords - deterministic) |
| 언어별 30개 단어 | Task 2 (words-en/es/pt.ts) |
| TTS 미지원 브라우저 안내 | Task 5 (WordCard) |
| 모바일/데스크톱 반응형 | All UI tasks (Tailwind) |
| 새로고침 후 상태 유지 | Task 3 (localStorage), Tasks 7-9 (useEffect loads from storage) |

All requirements covered. ✅

### Placeholder Scan

No TBD/TODO/placeholder patterns found. All code blocks complete. ✅

### Type Consistency Check

- `shuffleArray` used in `words.ts`, `quiz.ts` — same signature `shuffleArray<T>(array: T[], seed: number): T[]` ✅
- `getTodayWords(language: Language, date: string): Word[]` — consistent across Tasks 3, 7, 8, 9 ✅
- `generateQuiz(todayWords: Word[], allWordsForLang: Word[]): QuizQuestion[]` — consistent Tasks 4, 8 ✅
- `getQuizResult(language, date)` — consistent Tasks 3, 7, 9 ✅
- `saveQuizResult(result: QuizResult)` — consistent Tasks 3, 8 ✅
- `QuizQuestionCard` props: `{ question, onAnswer, answered }` — consistent Tasks 5, 8 ✅
