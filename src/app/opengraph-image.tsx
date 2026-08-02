import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const revalidate = 900;
export const alt = 'Stocks on Solana — Real-time Tokenized Equity Screener';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BRAND_GRAD = 'linear-gradient(135deg, #f8f700 0%, #fbae17 42%, #7f47dd 100%)';
const GREEN = '#00e676';
const RED = '#ff4d4d';

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
      mcap?: number;
      stockData?: { mcap?: number };
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

    const sorted = assets
      .filter((a) => a.usdPrice != null)
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

    const count = assets.length || 600;
    let liq = 0;
    let vol = 0;
    const umSeen = new Set<string>();
    let um = 0;
    for (const a of assets) {
      liq += a.liquidity ?? 0;
      vol += (a.stats24h?.buyVolume ?? 0) + (a.stats24h?.sellVolume ?? 0);
      const m = a.stockData?.mcap;
      if (m != null) {
        const k = m.toFixed(0);
        if (!umSeen.has(k)) {
          umSeen.add(k);
          um += m;
        }
      }
    }

    return {
      stocks,
      count: String(count),
      liq: fmtUsd(liq),
      vol: fmtUsd(vol),
      mcap: um > 0 ? fmtUsd(um) : '—',
    };
  } catch {
    return { stocks: FALLBACK, count: '600+', liq: '—', vol: '—', mcap: '—' };
  }
}

export default async function Image() {
  const fontsDir = path.join(process.cwd(), 'public/fonts');
  const [sgReg, sgBold, jbBold, logoData, live] = await Promise.all([
    readFile(path.join(fontsDir, 'SpaceGrotesk-Regular.ttf')),
    readFile(path.join(fontsDir, 'SpaceGrotesk-Bold.ttf')),
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
          position: 'relative',
          overflow: 'hidden',
          background: '#07060c',
          fontFamily: '"Space Grotesk"',
        }}
      >
        {/* Vibrant brand wash */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 90% 80% at 0% 0%, rgba(248,247,0,0.28) 0%, transparent 55%), radial-gradient(ellipse 80% 90% at 100% 100%, rgba(127,71,221,0.45) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 70% 20%, rgba(251,174,23,0.18) 0%, transparent 50%)',
            display: 'flex',
          }}
        />

        {/* Soft grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            display: 'flex',
          }}
        />

        {/* Brand bar */}
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

        {/* Big faded mark */}
        <div
          style={{
            position: 'absolute',
            right: -60,
            bottom: -80,
            display: 'flex',
            opacity: 0.18,
          }}
        >
          <img src={logo} width={520} height={520} />
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '52px 56px 48px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 560,
              paddingRight: 36,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 20,
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(251,174,23,0.25)',
                  }}
                >
                  <img src={logo} width={58} height={58} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: 18,
                      color: 'rgba(255,255,255,0.55)',
                      letterSpacing: 5,
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    STOCKS ON
                  </div>
                  <div
                    style={{
                      fontSize: 56,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: -1,
                      backgroundImage: BRAND_GRAD,
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
                  fontSize: 22,
                  color: '#f0e6ff',
                  lineHeight: 1.35,
                  fontWeight: 500,
                  maxWidth: 480,
                  marginBottom: 10,
                }}
              >
                The stock market never closes here.
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: 1,
                }}
              >
                Real-time tokenized equity screener
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 18 }}>
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
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    minWidth: 120,
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      fontFamily: '"JetBrains Mono"',
                      color: '#fff',
                    }}
                  >
                    {v}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right ticker card */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 20,
              background: 'rgba(8,8,12,0.72)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, fontWeight: 600 }}>
                TOP VOLUME · 24H
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: BRAND_GRAD,
                  color: '#0a0a0a',
                }}
              >
                LIVE
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', flex: 1 }}>
              {live.stocks.map((s, i) => (
                <div
                  key={s.sym}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 14px',
                    borderRadius: 12,
                    marginBottom: 6,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 36,
                      borderRadius: 4,
                      background: s.up ? GREEN : RED,
                      marginRight: 14,
                      display: 'flex',
                    }}
                  />
                  <div
                    style={{
                      width: 110,
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#fff',
                      fontFamily: '"JetBrains Mono"',
                    }}
                  >
                    {s.sym}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: 20,
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: '"JetBrains Mono"',
                    }}
                  >
                    {s.price}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: s.up ? GREEN : RED,
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
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 22px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>
                stocksonsolana.com
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                Design by Gray
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Space Grotesk', data: sgReg, weight: 400 },
        { name: 'Space Grotesk', data: sgBold, weight: 700 },
        { name: 'JetBrains Mono', data: jbBold, weight: 700 },
      ],
    },
  );
}
