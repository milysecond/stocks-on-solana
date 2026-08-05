import { NextResponse } from 'next/server';
import { discoverTokens } from '@/lib/discover-tokens';

export const runtime = 'edge';
export const revalidate = 60;

export async function GET() {
  const tokens = await discoverTokens();
  return NextResponse.json(tokens, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=15',
      'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
