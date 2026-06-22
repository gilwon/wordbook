import { ImageResponse } from 'next/og';
import { BookIcon } from '@/lib/icon-jsx';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<BookIcon size={32} />, { ...size });
}
