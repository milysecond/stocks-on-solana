import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Known icon URL patterns — fast path, no API call needed
function getKnownIconUrl(mint: string, symbol: string): string | null {
  // xStocks: all have icons at xstocks-metadata.backed.fi
  if (mint.startsWith('Xs') || symbol.endsWith('x') || symbol.endsWith('.Bx')) {
    const base = symbol.replace(/x$/, '').replace(/\.B$/, '');
    return `https://xstocks-metadata.backed.fi/logos/tokens/${symbol}.png`;
  }
  // PreStocks
  if (mint.startsWith('Pre')) {
    return null; // no known CDN
  }
  // Ondo tokens end in "ondo" — no real icon
  if (mint.endsWith('ondo')) {
    return null;
  }
  return null;
}

function generateSvg(symbol: string): string {
  const letters = symbol.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
  const hue = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const bg = `hsl(${hue}, 35%, 14%)`;
  const border = `hsl(${hue}, 50%, 28%)`;
  const color = `hsl(${hue}, 70%, 65%)`;
  const fs = letters.length === 1 ? 14 : 11;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
<rect width="32" height="32" rx="6" fill="${bg}" stroke="${border}" stroke-width="1"/>
<text x="16" y="${16 + fs * 0.35}" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-weight="700" font-size="${fs}" fill="${color}">${letters}</text>
</svg>`;
}

export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get('mint') || '';
  const symbol = req.nextUrl.searchParams.get('symbol') || '??';

  const svgResponse = () => new NextResponse(generateSvg(symbol), {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });

  // Try known CDN path first (no API call)
  const knownUrl = getKnownIconUrl(mint, symbol);
  if (knownUrl) {
    try {
      const res = await fetch(knownUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            'Content-Type': res.headers.get('content-type') || 'image/png',
            'Cache-Control': 'public, max-age=604800, immutable',
          },
        });
      }
    } catch { /* fall through */ }
  }

  // Skip Ondo tokens — no icons
  if (mint.endsWith('ondo') || !mint) return svgResponse();

  // Try Helius DAS for unknown tokens
  try {
    const apiKey = '8c4a4f60-92ba-4de2-b779-31201cb41a98';
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getAsset', params: { id: mint } }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json() as { result?: { content?: { links?: { image?: string } } } };
      const imageUrl = data?.result?.content?.links?.image;
      if (imageUrl && imageUrl.startsWith('http')) {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(3000) });
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer();
          return new NextResponse(buf, {
            headers: {
              'Content-Type': imgRes.headers.get('content-type') || 'image/png',
              'Cache-Control': 'public, max-age=604800, immutable',
            },
          });
        }
      }
    }
  } catch { /* fall through */ }

  return svgResponse();
}
