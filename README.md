# 단어 퀴즈 (Word Quiz)

영어, 스페인어, 포르투갈어 단어를 매일 학습하고 랜덤 퀴즈로 암기 여부를 확인하는 웹앱.

## 기능

- **오늘의 단어**: 날짜 + 언어 기반 결정론적 선택 (같은 날 = 같은 10단어)
- **단어 카드**: 단어, 한국어 뜻, 품사, 설명, 예문, 예문 번역, TTS 발음
- **랜덤 퀴즈**: 10문제 (뜻 고르기 / 단어 고르기 / 빈칸 채우기)
- **즉시 피드백**: 정답/오답 즉시 표시
- **결과 화면**: 점수, 틀린 단어 목록
- **TTS**: 브라우저 Web Speech API (en-US / es-ES / pt-BR)
- **상태 저장**: localStorage (퀴즈 결과, 언어 설정)

## 지원 언어

| 언어 | 코드 | 단어 수 |
|------|------|---------|
| 영어 | en | 60개 |
| 스페인어 | es | 60개 |
| 포르투갈어 | pt | 60개 |

단어 주제: 일반 어휘 · 일상 · 비즈니스 · 여행 · TOEIC

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + jsdom + @testing-library/react

## 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속.

## 테스트

```bash
npm test
```

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 홈 (언어 선택)
│   ├── [lang]/
│   │   ├── page.tsx          # 오늘의 단어 화면
│   │   └── quiz/
│   │       ├── page.tsx      # 퀴즈 화면
│   │       └── result/
│   │           └── page.tsx  # 결과 화면
├── components/
│   ├── WordCard.tsx          # 단어 카드
│   ├── QuizQuestion.tsx      # 퀴즈 문제
│   └── ProgressBar.tsx       # 진행률 바
├── data/
│   ├── words-en.ts           # 영어 단어 60개
│   ├── words-es.ts           # 스페인어 단어 60개
│   ├── words-pt.ts           # 포르투갈어 단어 60개
│   └── index.ts
└── lib/
    ├── types.ts              # TypeScript 타입 정의
    ├── words.ts              # 오늘의 단어 선택 로직 (LCG 셔플)
    ├── quiz.ts               # 퀴즈 생성 로직
    ├── storage.ts            # localStorage 유틸
    ├── tts.ts                # TTS (Web Speech API)
    └── utils.ts              # 공통 유틸
```

## 오늘의 단어 선택 알고리즘

```
hashString("en-2026-06-22") → 시드
→ LCG 셔플로 60개 단어 재배열
→ 앞 10개 반환
```

같은 날짜 + 언어 조합은 항상 동일한 10단어를 반환한다.
