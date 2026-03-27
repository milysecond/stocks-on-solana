import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';
import { ALL_TOKENS } from '@/lib/tokens';

export const runtime = 'nodejs';
export const revalidate = 1800;
export const alt = 'Stock on Solana';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ ticker: string }>;
}

function findToken(ticker: string) {
  const slug = ticker.toLowerCase();
  return ALL_TOKENS.find(t =>
    t.symbol.toLowerCase() === slug ||
    t.symbol.toLowerCase().replace(/[xon]+$/, '') === slug ||
    t.name.toLowerCase().replace(/\s+/g, '-') === slug
  );
}

async function fetchLiveData(symbol: string) {
  try {
    const providers = ['xstocks', 'ondo', 'prestocks'];
    for (const p of providers) {
      const res = await fetch(`https://datapi.jup.ag/v2/assets/stocks/24h?stocks=${p}&offset=0&includeOndoStatus=false`, {
        next: { revalidate: 1800 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const found = (data.assets || []).find((a: any) =>
        a.symbol?.toLowerCase() === symbol.toLowerCase()
      );
      if (found) return found;
    }
  } catch {}
  return null;
}

function fmtPrice(p: number) {
  if (p >= 1000) return `$${(p / 1000).toFixed(1)}K`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

function fmtMcap(m: number) {
  if (m >= 1e9) return `$${(m / 1e9).toFixed(1)}B`;
  if (m >= 1e6) return `$${(m / 1e6).toFixed(1)}M`;
  return `$${(m / 1e3).toFixed(0)}K`;
}

export default async function Image({ params }: Props) {
  const { ticker } = await params;
  const token = findToken(ticker);
  if (!token) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 32, fontFamily: 'sans-serif' }}>
        Stock not found
      </div>,
      { ...size }
    );
  }

  const [fontRegData, fontBoldData, logoData, live] = await Promise.all([
    readFile(path.join(process.cwd(), 'public/fonts/JetBrainsMono-Regular.ttf')),
    readFile(path.join(process.cwd(), 'public/fonts/JetBrainsMono-Bold.ttf')),
    readFile(path.join(process.cwd(), 'public/logo.png')),
    fetchLiveData(token.symbol),
  ]);

  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  const price = live?.usdPrice ? fmtPrice(live.usdPrice) : '—';
  const mcap = live?.mcap ? fmtMcap(live.mcap) : '—';
  const holders = live?.holderCount ? live.holderCount.toLocaleString() : '—';
  const chg24h = live?.stats24h?.priceChange ?? null;
  const chgStr = chg24h !== null ? `${chg24h >= 0 ? '+' : ''}${chg24h.toFixed(2)}%` : '—';
  const isUp = chg24h === null || chg24h >= 0;
  const stockPrice = live?.stockData?.price ? fmtPrice(live.stockData.price) : null;
  const cleanSymbol = token.symbol.replace(/[xX]$/, '').replace(/on$/, '').replace(/pre$/i, '');

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"JetBrains Mono"',
        padding: '48px 64px',
        borderTop: `4px solid ${isUp ? '#00c864' : '#dc3c3c'}`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={logoBase64} width={64} height={64} style={{ borderRadius: 12 }} />
            <span style={{ fontSize: 15, color: '#555', letterSpacing: 4 }}>STOCKS ON SOLANA</span>
          </div>
          <span style={{ fontSize: 12, color: '#666', letterSpacing: 2, border: '1px solid #2a2a2a', borderRadius: 4, padding: '4px 14px' }}>
            {token.provider.toUpperCase()}
          </span>
        </div>

        {/* Ticker + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 6 }}>
          {live?.icon ? (
            <img src={live.icon} width={72} height={72} style={{ borderRadius: 36 }} />
          ) : null}
          <span style={{ fontSize: 60, fontWeight: 700, color: '#e8e8e8' }}>{cleanSymbol}</span>
          <span style={{ fontSize: 22, color: '#555' }}>{token.symbol}</span>
        </div>
        <span style={{ fontSize: 20, color: '#777', marginBottom: 36 }}>{token.name}</span>

        {/* Price + Change */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 36 }}>
          <span style={{ fontSize: 48, fontWeight: 700, color: '#ff9900' }}>{price}</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: isUp ? '#00c864' : '#dc3c3c' }}>
            {`${isUp ? '▲' : '▼'} ${chgStr}`}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 56 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#555', letterSpacing: 3 }}>MCAP</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#ccc' }}>{mcap}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#555', letterSpacing: 3 }}>HOLDERS</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#ccc' }}>{holders}</span>
          </div>
          {stockPrice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#555', letterSpacing: 3 }}>STOCK PRICE</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#ccc' }}>{stockPrice}</span>
            </div>
          ) : null}
        </div>

        {/* Large faded logo on right */}
        {live?.icon ? (
          <div style={{ display: 'flex', position: 'absolute', right: -40, bottom: -40, opacity: 0.07 }}>
            <img src={live.icon} width={520} height={520} style={{ borderRadius: 260 }} />
          </div>
        ) : null}

        {/* Footer */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 13, color: '#333', letterSpacing: 2 }}>
            {`stocksonsolana.com/${token.symbol.toLowerCase()}`}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'JetBrains Mono', data: fontRegData, weight: 400 },
        { name: 'JetBrains Mono', data: fontBoldData, weight: 700 },
      ],
    }
  );
}
