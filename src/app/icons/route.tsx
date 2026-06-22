import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { BookIcon } from '@/lib/icon-jsx';

export async function GET(req: NextRequest) {
  const size = Number(req.nextUrl.searchParams.get('size')) || 192;
  return new ImageResponse(<BookIcon size={size} />, { width: size, height: size });
}
