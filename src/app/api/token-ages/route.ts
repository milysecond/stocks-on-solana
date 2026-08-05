import { NextResponse } from 'next/server';
import { fetchTokenAges } from '@/lib/discover-tokens';

export const runtime = 'edge';
export const revalidate = 3600;

/**
 * Token ages from Jupiter `createdAt` / `firstPool.createdAt` (unix seconds).
 * Fast — shares the screener crawl cache. No Solana RPC history walks.
 */
export async function GET() {
  const ages = await fetchTokenAges();
  return NextResponse.json(ages, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400, max-age=300',
      'CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
