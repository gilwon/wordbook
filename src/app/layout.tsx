import type { Metadata } from 'next';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: '단어 퀴즈 | 매일 외국어 학습',
  description: '영어, 스페인어, 포르투갈어 단어를 매일 학습하고 퀴즈로 확인하세요.',
  manifest: '/manifest.webmanifest',
  icons: { apple: '/icon.svg' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '단어 퀴즈',
  },
};

const themeScript = `try{var t=localStorage.getItem('word-quiz-theme');document.documentElement.classList.toggle('dark',t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 min-h-screen antialiased">
        {/* Inline script runs before body renders — prevents dark/light flash */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <main className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
