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
