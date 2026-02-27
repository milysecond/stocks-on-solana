import { NextResponse } from 'next/server';
import { ALL_TOKENS } from '@/lib/tokens';

export const runtime = 'edge';
export const revalidate = 30;

export interface PriceEntry {
  price: number;
  change24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  stockPrice: number | null;
  mcap: number | null;
}

const JUP_API_KEY = '3309da44-211b-4acb-9d31-c36fb54d9459';

export async function GET() {
  const mints = ALL_TOKENS.map(t => t.mint);
  const result: Record<string, PriceEntry> = {};

  // Jupiter Price V3 — up to 50 per call
  const chunkSize = 50;
  for (let i = 0; i < mints.length; i += chunkSize) {
    const chunk = mints.slice(i, i + chunkSize);
    try {
      const res = await fetch(
        `https://api.jup.ag/price/v3?ids=${chunk.join(',')}`,
        {
          headers: { 'x-api-key': JUP_API_KEY },
          next: { revalidate: 30 },
        }
      );
      const data: Record<string, {
        usdPrice: number;
        priceChange24h?: number;
        liquidity?: number;
        stockData?: { price: number; mcap: number };
      }> = await res.json();

      for (const [mint, entry] of Object.entries(data)) {
        result[mint] = {
          price: entry.usdPrice,
          change24h: entry.priceChange24h ?? null,
          volume24h: null,
          liquidity: entry.liquidity ?? null,
          stockPrice: entry.stockData?.price ?? null,
          mcap: entry.stockData?.mcap ?? null,
        };
      }
    } catch (e) {
      console.error('Jupiter Price V3 error:', e);
    }
  }

  return NextResponse.json(result);
}
