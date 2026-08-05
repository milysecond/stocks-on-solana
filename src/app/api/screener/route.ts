import { NextResponse } from 'next/server';
import { fetchScreenerBundle } from '@/lib/discover-tokens';

export const runtime = 'edge';
export const revalidate = 20;

/**
 * Single bootstrap payload: tokens + prices from one Jupiter crawl.
 * Cache-Control lets CF edge serve warm responses in ~ms.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cacheKey = new Request(url.toString(), request);

  // Cloudflare Cache API (best-effort)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cache = (caches as any)?.default as Cache | undefined;
    if (cache) {
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
    }
  } catch {
    /* ignore */
  }

  const bundle = await fetchScreenerBundle();
  const res = NextResponse.json(bundle, {
    headers: {
      'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60, max-age=10',
      'CDN-Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60',
      'Access-Control-Allow-Origin': '*',
    },
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cache = (caches as any)?.default as Cache | undefined;
    if (cache) {
      const copy = res.clone();
      // fire-and-forget
      void cache.put(cacheKey, copy);
    }
  } catch {
    /* ignore */
  }

  return res;
}
