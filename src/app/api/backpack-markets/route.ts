import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 300; // 5 minutes — market list changes rarely

// Server-side proxy: Backpack's public API sends no CORS headers, so the
// browser can't read it directly. We fetch it here and return just the count.
export async function GET() {
  try {
    const res = await fetch('https://api.backpack.exchange/api/v1/markets', {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    if (!Array.isArray(data)) return NextResponse.json({ count: null, stockTickers: [] });
    const count = data.length;
    // Backpack lists tokenized US equities with a ".US" base symbol (e.g. MU.US).
    // Strip the suffix to get the bare ticker for matching against the screener.
    const stockTickers = Array.from(
      new Set(
        data
          .map((m) => String(m?.baseSymbol ?? ''))
          .filter((b) => b.endsWith('.US'))
          .map((b) => b.replace(/\.US$/, '').toUpperCase())
      )
    );
    return NextResponse.json({ count, stockTickers });
  } catch {
    return NextResponse.json({ count: null, stockTickers: [] });
  }
}
