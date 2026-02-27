import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Simple cache: mint → icon URL (edge-compatible)
const iconCache = new Map<string, string | null>();

function generateSvg(symbol: string, color = '#ff9900'): string {
  const letters = symbol.replace(/[^A-Z]/gi, '').slice(0, 2).toUpperCase();
  // Pick a stable hue based on symbol
  const hue = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const bg = `hsl(${hue}, 40%, 15%)`;
  const border = `hsl(${hue}, 60%, 35%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="6" fill="${bg}" stroke="${border}" stroke-width="1"/>
    <text x="16" y="21" text-anchor="middle" font-family="monospace" font-weight="700" font-size="${letters.length === 1 ? 16 : 13}" fill="${color}">${letters}</text>
  </svg>`;
}

export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get('mint');
  const symbol = req.nextUrl.searchParams.get('symbol') || '??';

  if (!mint) {
    const svg = generateSvg(symbol);
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
    });
  }

  // Check cache
  if (iconCache.has(mint)) {
    const cached = iconCache.get(mint);
    if (cached) {
      // Proxy the image
      try {
        const res = await fetch(cached, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const buf = await res.arrayBuffer();
          const ct = res.headers.get('content-type') || 'image/png';
          return new NextResponse(buf, {
            headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' },
          });
        }
      } catch { /* fall through */ }
    }
    // null cached = use generated
    const svg = generateSvg(symbol);
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
    });
  }

  // Try Jupiter token list API
  const iconUrl = await resolveIconUrl(mint);
  iconCache.set(mint, iconUrl);

  if (iconUrl) {
    try {
      const res = await fetch(iconUrl, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const ct = res.headers.get('content-type') || 'image/png';
        return new NextResponse(buf, {
          headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' },
        });
      }
    } catch { /* fall through */ }
  }

  // Fallback: generated SVG
  const svg = generateSvg(symbol);
  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}

async function resolveIconUrl(mint: string): Promise<string | null> {
  // Try Jupiter strict token list (fast, no auth needed)
  try {
    const url = `https://token.jup.ag/all`;
    // This is too large to fetch per request — use DAS instead
  } catch { /* skip */ }

  // Try Helius DAS (getAsset) for token metadata
  try {
    const heliusKey = process.env.HELIUS_API_KEY || '8c4a4f60-92ba-4de2-b779-31201cb41a98';
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getAsset', params: { id: mint } }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      const uri = data?.result?.content?.links?.image || data?.result?.content?.json_uri;
      if (uri && uri.startsWith('http')) return uri;
    }
  } catch { /* skip */ }

  return null;
}
