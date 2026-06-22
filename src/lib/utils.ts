import type { Language } from '@/lib/types';

export const VALID_LANGS: Language[] = ['en', 'es', 'pt'];

export function getTodayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
