import { NextResponse } from 'next/server';
import { ALL_TOKENS } from '@/lib/tokens';

export const runtime = 'edge';
export const revalidate = 86400; // 24 hours — creation dates never change

const RPC = 'https://viviyan-bkj12u-fast-mainnet.helius-rpc.com';

// Module-level cache: persists across requests within the same Edge instance lifetime
const ageCache = new Map<string, number>();

async function getOldestBlockTime(mint: string): Promise<number | null> {
  if (ageCache.has(mint)) return ageCache.get(mint)!;

  try {
    let before: string | undefined;
    let oldestBlockTime: number | null = null;

    // Paginate getSignaturesForAddress until we exhaust the history
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const body: Record<string, unknown> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          mint,
          {
            limit: 1000,
            ...(before ? { before } : {}),
          },
        ],
      };

      const res = await fetch(RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) break;

      const json = await res.json() as { result?: { signature: string; blockTime: number | null }[] };
      const sigs = json.result;
      if (!sigs || sigs.length === 0) break;

      // Last entry in the page is the oldest on this page
      const last = sigs[sigs.length - 1];
      if (last.blockTime !== null && last.blockTime !== undefined) {
        oldestBlockTime = last.blockTime;
      }

      // If we got fewer than 1000 results, we've reached the beginning
      if (sigs.length < 1000) break;

      // Otherwise, paginate further back
      before = last.signature;
    }

    if (oldestBlockTime !== null) {
      ageCache.set(mint, oldestBlockTime);
    }
    return oldestBlockTime;
  } catch {
    return null;
  }
}

async function processBatch(mints: string[]): Promise<Record<string, number>> {
  const results = await Promise.allSettled(
    mints.map(mint => getOldestBlockTime(mint).then(t => ({ mint, t })))
  );
  const out: Record<string, number> = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.t !== null) {
      out[r.value.mint] = r.value.t;
    }
  }
  return out;
}

export async function GET() {
  const mints = ALL_TOKENS.map(t => t.mint).filter(Boolean);

  // Check how many are already cached
  const uncached = mints.filter(m => !ageCache.has(m));
  const cached: Record<string, number> = {};
  for (const m of mints) {
    if (ageCache.has(m)) cached[m] = ageCache.get(m)!;
  }

  // Process uncached in batches of 10
  const BATCH = 10;
  for (let i = 0; i < uncached.length; i += BATCH) {
    const batch = uncached.slice(i, i + BATCH);
    const batchResult = await processBatch(batch);
    Object.assign(cached, batchResult);
  }

  return NextResponse.json(cached, {
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
