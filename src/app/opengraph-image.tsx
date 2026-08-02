import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';
import { BRAND } from '@/lib/brand';

export const runtime = 'nodejs';
export const revalidate = 900;
export const alt = 'Stocks on Solana — Real-time Tokenized Equity Screener';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FALLBACK = [
  { sym: 'AAPL', price: '—', chg: '—', up: true },
  { sym: 'NVDA', price: '—', chg: '—', up: true },
  { sym: 'TSLA', price: '—', chg: '—', up: false },
  { sym: 'MU', price: '—', chg: '—', up: true },
  { sym: 'SPCX', price: '—', chg: '—', up: true },
];

function fmtUsd(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

async function fetchLive() {
  try {
    const assets: Array<{
      symbol: string;
      usdPrice?: number;
      liquidity?: number;
      stats24h?: { priceChange?: number; buyVolume?: number; sellVolume?: number };
    }> = [];
    let offset = 0;
    let total = Infinity;
    while (offset < total && offset < 650) {
      const res = await fetch(
        `https://datapi.jup.ag/v2/assets/stocks/24h?offset=${offset}&includeOndoStatus=false`,
        { next: { revalidate: 900 } },
      );
      if (!res.ok) break;
      const data = await res.json();
      total = data.total ?? 0;
      assets.push(...(data.assets || []));
      offset += 50;
      if (!(data.assets || []).length) break;
    }

    // Prefer liquid books for social card (brand: honest liquidity)
    const MIN_LIQ = 1000;
    const sorted = assets
      .filter((a) => a.usdPrice != null && (a.liquidity ?? 0) >= MIN_LIQ)
      .sort((a, b) => {
        const va = (a.stats24h?.buyVolume ?? 0) + (a.stats24h?.sellVolume ?? 0);
        const vb = (b.stats24h?.buyVolume ?? 0) + (b.stats24h?.sellVolume ?? 0);
        return vb - va;
      })
      .slice(0, 5);

    const stocks = sorted.length
      ? sorted.map((a) => {
          const chg = a.stats24h?.priceChange ?? 0;
          return {
            sym: a.symbol.replace(/x$/i, '').replace(/on$/i, ''),
            price: `$${a.usdPrice!.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            chg: `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`,
            up: chg >= 0,
          };
        })
      : FALLBACK;

    let liq = 0;
    let vol = 0;
    for (const a of assets) {
      liq += a.liquidity ?? 0;
      vol += (a.stats24h?.buyVolume ?? 0) + (a.stats24h?.sellVolume ?? 0);
    }

    return {
      stocks,
      count: String(assets.length || 600),
      liq: fmtUsd(liq),
      vol: fmtUsd(vol),
    };
  } catch {
    return { stocks: FALLBACK, count: '600+', liq: '—', vol: '—' };
  }
}

/**
 * Open Graph card — follows /brand guide:
 * - Ink bg, panel surfaces, border #222
 * - Bare gradient mark (no box / no drop shadow)
 * - Brand gradient bar + text only
 * - Space Grotesk UI · JetBrains Mono numbers
 */
export default async function Image() {
  const fontsDir = path.join(process.cwd(), 'public/fonts');
  const [sgMed, sgBold, jbReg, jbBold, logoData, live] = await Promise.all([
    readFile(path.join(fontsDir, 'SpaceGrotesk-Medium.ttf')),
    readFile(path.join(fontsDir, 'SpaceGrotesk-Bold.ttf')),
    readFile(path.join(fontsDir, 'JetBrainsMono-Regular.ttf')),
    readFile(path.join(fontsDir, 'JetBrainsMono-Bold.ttf')),
    readFile(path.join(process.cwd(), 'public/logo-mark.png')),
    fetchLive(),
  ]);

  const logo = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: BRAND.ink,
          fontFamily: '"Space Grotesk"',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Brand bar — exact guide gradient */}
        <div
          style={{
            width: '100%',
            height: 6,
            background: BRAND.gradient,
            display: 'flex',
            flexShrink: 0,
          }}
        />

        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '48px 56px 44px',
            gap: 48,
          }}
        >
          {/* LEFT — identity */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 520,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Bare mark + wordmark — no chrome box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <img src={logo} width={80} height={80} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: 18,
                      color: BRAND.muted,
                      letterSpacing: 5,
                      fontWeight: 500,
                      marginBottom: 6,
                    }}
                  >
                    STOCKS ON
                  </div>
                  <div
                    style={{
                      fontSize: 58,
                      fontWeight: 700,
                      lineHeight: 0.95,
                      letterSpacing: -1.5,
                      backgroundImage: BRAND.gradient,
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    SOLANA
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: BRAND.body,
                  lineHeight: 1.3,
                  marginBottom: 10,
                }}
              >
                {BRAND.tagline}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: BRAND.muted,
                  letterSpacing: 2,
                }}
              >
                REAL-TIME TOKENIZED EQUITY SCREENER
              </div>
            </div>

            {/* Stats — panel tokens */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                [live.count, 'STOCKS'],
                [live.vol, '24H VOL'],
                [live.liq, 'LIQUIDITY'],
              ].map(([v, l]) => (
                <div
                  key={l as string}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: '16px 18px',
                    borderRadius: 8,
                    background: BRAND.panel,
                    border: `1px solid ${BRAND.border}`,
                    minWidth: 128,
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      fontFamily: '"JetBrains Mono"',
                      color: BRAND.brandAmber,
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: BRAND.muted,
                      letterSpacing: 2,
                      fontWeight: 500,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — ticker panel */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: BRAND.panel,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
                borderBottom: `1px solid ${BRAND.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: BRAND.muted,
                  letterSpacing: 3,
                  fontWeight: 600,
                }}
              >
                TOP VOLUME · 24H
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  padding: '5px 12px',
                  borderRadius: 4,
                  background: BRAND.gradient,
                  color: BRAND.ink,
                }}
              >
                LIVE
              </div>
            </div>

            {/* Column headers */}
            <div
              style={{
                display: 'flex',
                padding: '10px 22px 6px',
                fontSize: 11,
                color: BRAND.dim,
                letterSpacing: 2,
                fontWeight: 500,
              }}
            >
              <span style={{ width: 120 }}>TICKER</span>
              <span style={{ width: 150 }}>PRICE</span>
              <span>24H</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 12px 12px', flex: 1 }}>
              {live.stocks.map((s, i) => (
                <div
                  key={s.sym}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 10px',
                    borderRadius: 6,
                    background: i % 2 === 0 ? BRAND.ink : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 28,
                      borderRadius: 2,
                      background: s.up ? BRAND.green : BRAND.red,
                      marginRight: 14,
                      display: 'flex',
                    }}
                  />
                  <div
                    style={{
                      width: 110,
                      fontSize: 20,
                      fontWeight: 700,
                      color: BRAND.body,
                      fontFamily: '"JetBrains Mono"',
                    }}
                  >
                    {s.sym}
                  </div>
                  <div
                    style={{
                      width: 150,
                      fontSize: 18,
                      color: BRAND.muted,
                      fontFamily: '"JetBrains Mono"',
                    }}
                  >
                    {s.price}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: s.up ? BRAND.green : BRAND.red,
                      fontFamily: '"JetBrains Mono"',
                    }}
                  >
                    {s.chg}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 22px',
                borderTop: `1px solid ${BRAND.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: BRAND.brandAmber,
                  letterSpacing: 1,
                  fontWeight: 600,
                }}
              >
                stocksonsolana.com
              </div>
              <div style={{ fontSize: 12, color: BRAND.dim }}>Design by Gray</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Space Grotesk', data: sgMed, weight: 500 },
        { name: 'Space Grotesk', data: sgBold, weight: 700 },
        { name: 'JetBrains Mono', data: jbReg, weight: 400 },
        { name: 'JetBrains Mono', data: jbBold, weight: 700 },
      ],
    },
  );
}
