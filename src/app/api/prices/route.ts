import { NextResponse } from 'next/server';
import { fetchScreenerPrices } from '@/lib/discover-tokens';

export const runtime = 'edge';
export const revalidate = 20;

export interface PriceEntry {
  price: number;
  change24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  stockPrice: number | null;
  mcap: number | null;
  underlyingMcap: number | null;
}

export async function GET() {
  const result = await fetchScreenerPrices();
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60, max-age=10',
      'CDN-Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60',
    },
  });
}
