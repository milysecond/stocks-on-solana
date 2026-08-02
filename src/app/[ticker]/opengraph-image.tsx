import { ImageResponse } from 'next/og';
import { ALL_TOKENS } from '@/lib/tokens';

export const runtime = 'edge';
export const revalidate = 900;
export const alt = 'Stock on Solana';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BRAND_GRAD = 'linear-gradient(135deg, #f8f700 0%, #fbae17 42%, #7f47dd 100%)';
const GREEN = '#00e676';
const RED = '#ff4d4d';

interface Props {
  params: Promise<{ ticker: string }>;
}

function findToken(ticker: string) {
  const slug = ticker.toLowerCase();
  return ALL_TOKENS.find(
    (t) =>
      t.symbol.toLowerCase() === slug ||
      t.symbol.toLowerCase().replace(/[xon]+$/, '') === slug ||
      t.name.toLowerCase().replace(/\s+/g, '-') === slug,
  );
}

async function fetchLiveData(symbol: string) {
  try {
    // unfiltered feed first pages + known providers
    const urls = [
      'https://datapi.jup.ag/v2/assets/stocks/24h?offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=xstocks&offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=backpack&offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=ondo&offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=prestocks&offset=0&includeOndoStatus=false',
    ];
    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const found = (data.assets || []).find(
        (a: { symbol?: string }) => a.symbol?.toLowerCase() === symbol.toLowerCase(),
      );
      if (found) return found;
    }
  } catch {
    /* ignore */
  }
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
  if (m >= 1e3) return `$${(m / 1e3).toFixed(0)}K`;
  return `$${m.toFixed(0)}`;
}

export default async function Image({ params }: Props) {
  const { ticker } = await params;
  const token = findToken(ticker);

  if (!token) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#07060c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            fontSize: 32,
            fontFamily: 'sans-serif',
          }}
        >
          Stock not found
        </div>
      ),
      { ...size },
    );
  }

  const [sgBold, jbBold, logoData, live] = await Promise.all([
    fetch(new URL('/fonts/SpaceGrotesk-Bold.ttf', 'https://stocksonsolana.com')).then((r) =>
      r.arrayBuffer(),
    ),
    fetch(new URL('/fonts/JetBrainsMono-Bold.ttf', 'https://stocksonsolana.com')).then((r) =>
      r.arrayBuffer(),
    ),
    fetch(new URL('/logo-mark.png', 'https://stocksonsolana.com')).then((r) => r.arrayBuffer()),
    fetchLiveData(token.symbol),
  ]);

  const logo = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;
  const price = live?.usdPrice != null ? fmtPrice(live.usdPrice) : '—';
  const mcap = live?.mcap != null ? fmtMcap(live.mcap) : '—';
  const liq = live?.liquidity != null ? fmtMcap(live.liquidity) : '—';
  const chg24h = live?.stats24h?.priceChange ?? null;
  const chgStr = chg24h !== null ? `${chg24h >= 0 ? '+' : ''}${chg24h.toFixed(2)}%` : '—';
  const isUp = chg24h === null || chg24h >= 0;
  const stockPrice = live?.stockData?.price != null ? fmtPrice(live.stockData.price) : null;
  const cleanSymbol = token.symbol.replace(/[xX]$/, '').replace(/on$/i, '').replace(/pre$/i, '');
  const provider =
    token.provider === 'Backpack' ? 'SUNRISE' : token.provider.toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: '#07060c',
          fontFamily: '"Space Grotesk"',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isUp
              ? 'radial-gradient(ellipse 80% 70% at 15% 20%, rgba(0,230,118,0.18) 0%, transparent 50%), radial-gradient(ellipse 90% 80% at 100% 100%, rgba(127,71,221,0.4) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 60% 0%, rgba(248,247,0,0.2) 0%, transparent 45%)'
              : 'radial-gradient(ellipse 80% 70% at 15% 20%, rgba(255,77,77,0.2) 0%, transparent 50%), radial-gradient(ellipse 90% 80% at 100% 100%, rgba(127,71,221,0.4) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 60% 0%, rgba(251,174,23,0.18) 0%, transparent 45%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: BRAND_GRAD,
            display: 'flex',
          }}
        />

        {live?.icon ? (
          <div
            style={{
              position: 'absolute',
              right: -80,
              bottom: -80,
              display: 'flex',
              opacity: 0.12,
            }}
          >
            <img src={live.icon} width={560} height={560} style={{ borderRadius: 280 }} />
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              right: -40,
              bottom: -60,
              display: 'flex',
              opacity: 0.16,
            }}
          >
            <img src={logo} width={480} height={480} />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '48px 56px 44px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 40,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src={logo} width={48} height={48} />
              <span
                style={{
                  fontSize: 16,
                  letterSpacing: 3,
                  fontWeight: 700,
                  backgroundImage: BRAND_GRAD,
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                STOCKS ON SOLANA
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
              }}
            >
              {provider}
            </div>
          </div>

          {/* Ticker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            {live?.icon ? (
              <img src={live.icon} width={80} height={80} style={{ borderRadius: 20 }} />
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span style={{ fontSize: 64, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  {cleanSymbol}
                </span>
                <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)' }}>{token.symbol}</span>
              </div>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>
                {token.name}
              </span>
            </div>
          </div>

          {/* Price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 22,
              marginTop: 28,
              marginBottom: 36,
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                fontFamily: '"JetBrains Mono"',
                backgroundImage: BRAND_GRAD,
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {price}
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: '"JetBrains Mono"',
                color: isUp ? GREEN : RED,
                padding: '8px 16px',
                borderRadius: 12,
                background: isUp ? 'rgba(0,230,118,0.12)' : 'rgba(255,77,77,0.12)',
              }}
            >
              {`${isUp ? '▲' : '▼'} ${chgStr}`}
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              ['ON-CHAIN MCAP', mcap],
              ['LIQUIDITY', liq],
              ...(stockPrice ? [['STOCK', stockPrice]] : []),
            ].map(([label, val]) => (
              <div
                key={label as string}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '16px 20px',
                  borderRadius: 14,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  minWidth: 150,
                }}
              >
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: '"JetBrains Mono"',
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 'auto',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>
              {`stocksonsolana.com/token/${token.symbol.toLowerCase()}`}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>Design by Gray</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Space Grotesk', data: sgBold, weight: 700 },
        { name: 'JetBrains Mono', data: jbBold, weight: 700 },
      ],
    },
  );
}
