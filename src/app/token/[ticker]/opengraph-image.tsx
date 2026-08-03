import { ImageResponse } from 'next/og';
import { ALL_TOKENS } from '@/lib/tokens';
import { BRAND } from '@/lib/brand';

export const runtime = 'edge';
export const revalidate = 300;
export const alt = 'Tokenized stock on Solana — Stocks on Solana';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ ticker: string }>;
  searchParams?: Promise<{ mint?: string }>;
}

async function findToken(ticker: string, mint?: string | null) {
  const { resolveToken } = await import('@/lib/resolve-token');
  return (
    (await resolveToken(ticker, mint)) ||
    ALL_TOKENS.find((t) => t.symbol.toLowerCase() === ticker.toLowerCase())
  );
}

type Live = {
  symbol?: string;
  icon?: string;
  usdPrice?: number;
  liquidity?: number;
  mcap?: number;
  stockData?: { price?: number; mcap?: number } | null;
  stats24h?: { priceChange?: number; buyVolume?: number; sellVolume?: number } | null;
};

async function fetchLiveData(symbol: string, mint?: string): Promise<Live | null> {
  try {
    // Prefer unfiltered feed then provider feeds
    const urls = [
      'https://datapi.jup.ag/v2/assets/stocks/24h?offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=backpack&offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=xstocks&offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=ondo&offset=0&includeOndoStatus=false',
      'https://datapi.jup.ag/v2/assets/stocks/24h?stocks=prestocks&offset=0&includeOndoStatus=false',
    ];
    for (const url of urls) {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = (await res.json()) as { assets?: Live & { id?: string; symbol?: string }[] };
      const assets = data.assets || [];
      const found =
        (mint && assets.find((a) => a.id === mint)) ||
        assets.find((a) => a.symbol?.toLowerCase() === symbol.toLowerCase());
      if (found) return found as Live;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function fmtPrice(p: number) {
  if (p >= 1000) return `$${(p / 1000).toFixed(2)}K`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

function fmtVol(m: number) {
  if (m >= 1e9) return `$${(m / 1e9).toFixed(2)}B`;
  if (m >= 1e6) return `$${(m / 1e6).toFixed(2)}M`;
  if (m >= 1e3) return `$${(m / 1e3).toFixed(1)}K`;
  return `$${m.toFixed(0)}`;
}

const PROVIDER_COLOR: Record<string, string> = {
  SUNRISE: '#E33E3E',
  BACKPACK: '#E33E3E',
  XSTOCKS: '#00C2FF',
  ONDO: '#6C5CE7',
  PRESTOCKS: '#A855F7',
  SHIFT: '#FBAE17',
  TESSERA: '#22C55E',
  SUPERSTATE: '#FFB000',
};

/** Premium token OG card — brand gradient, giant ticker, live mark */
export default async function Image({ params, searchParams }: Props) {
  const { ticker } = await params;
  const sp = searchParams ? await searchParams : {};
  const token = await findToken(ticker, sp.mint);

  const fontBase = BRAND.site;
  const [sgBold, sgMed, jbBold, logoData] = await Promise.all([
    fetch(`${fontBase}/fonts/SpaceGrotesk-Bold.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${fontBase}/fonts/SpaceGrotesk-Medium.ttf`)
      .then((r) => (r.ok ? r.arrayBuffer() : fetch(`${fontBase}/fonts/SpaceGrotesk-Bold.ttf`).then((x) => x.arrayBuffer())))
      .catch(() => fetch(`${fontBase}/fonts/SpaceGrotesk-Bold.ttf`).then((x) => x.arrayBuffer())),
    fetch(`${fontBase}/fonts/JetBrainsMono-Bold.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${fontBase}/logo-mark.png`).then((r) => r.arrayBuffer()),
  ]);

  const logo = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;

  if (!token) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: BRAND.ink,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Space Grotesk"',
          }}
        >
          <div style={{ width: '100%', height: 8, background: BRAND.gradient, position: 'absolute', top: 0, left: 0, display: 'flex' }} />
          <img src={logo} width={72} height={72} />
          <div style={{ fontSize: 28, color: BRAND.muted, marginTop: 24, letterSpacing: 4 }}>TOKEN NOT FOUND</div>
        </div>
      ),
      {
        ...size,
        fonts: [{ name: 'Space Grotesk', data: sgBold, weight: 700 }],
      },
    );
  }

  const live = await fetchLiveData(token.symbol, token.mint);

  const rawPrice = live?.usdPrice != null ? Number(live.usdPrice) : null;
  const stockPx = live?.stockData?.price != null ? Number(live.stockData.price) : null;
  const liqN = live?.liquidity != null ? Number(live.liquidity) : 0;
  const volN =
    (live?.stats24h?.buyVolume != null ? Number(live.stats24h.buyVolume) : 0) +
    (live?.stats24h?.sellVolume != null ? Number(live.stats24h.sellVolume) : 0);
  const reliable =
    rawPrice != null &&
    liqN >= 1000 &&
    (stockPx == null || stockPx <= 0 || (rawPrice / stockPx <= 3 && rawPrice / stockPx >= 1 / 3));

  const price =
    reliable && rawPrice != null
      ? fmtPrice(rawPrice)
      : stockPx != null
        ? fmtPrice(stockPx)
        : rawPrice != null
          ? fmtPrice(rawPrice)
          : '—';
  const mcap =
    reliable && live?.mcap != null
      ? fmtVol(Number(live.mcap))
      : live?.stockData?.mcap != null
        ? fmtVol(Number(live.stockData.mcap))
        : '—';
  const liq = liqN > 0 ? fmtVol(liqN) : '—';
  const vol = volN > 0 ? fmtVol(volN) : '—';
  const chg24h = reliable ? (live?.stats24h?.priceChange ?? null) : null;
  const chgNum = chg24h != null ? Number(chg24h) : null;
  const isUp = chgNum === null || chgNum >= 0;
  const chgStr = chgNum !== null ? `${chgNum >= 0 ? '+' : ''}${chgNum.toFixed(2)}%` : '—';

  const cleanSymbol = token.symbol.replace(/pre$/i, '').replace(/on$/i, '').replace(/x$/i, '') || token.symbol;
  const provider = token.provider === 'Backpack' ? 'SUNRISE' : token.provider.toUpperCase();
  const providerColor = PROVIDER_COLOR[provider] || BRAND.brandAmber;
  const stockPrice = stockPx != null ? fmtPrice(stockPx) : null;
  const premium =
    reliable && rawPrice != null && stockPx != null && stockPx > 0
      ? ((rawPrice - stockPx) / stockPx) * 100
      : null;
  const premiumStr =
    premium != null ? `${premium >= 0 ? '+' : ''}${premium.toFixed(2)}% vs stock` : null;

  // Decorative “spark” bars for visual energy (deterministic from symbol)
  const bars = Array.from({ length: 24 }, (_, i) => {
    const seed = (cleanSymbol.charCodeAt(i % cleanSymbol.length) || 1) * (i + 3);
    const h = 20 + (seed % 70);
    return h;
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: BRAND.ink,
          fontFamily: '"Space Grotesk"',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Soft brand wash (not fighting the logo) */}
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -80,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: 'rgba(127,71,221,0.18)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -140,
            bottom: -160,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: 'rgba(248,247,0,0.08)',
            display: 'flex',
          }}
        />

        {/* Left accent rail */}
        <div
          style={{
            width: 10,
            height: '100%',
            background: BRAND.gradient,
            display: 'flex',
            flexShrink: 0,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '40px 52px 36px 48px',
            position: 'relative',
          }}
        >
          {/* Top bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src={logo} width={48} height={48} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 3,
                    backgroundImage: BRAND.gradient,
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  STOCKS ON SOLANA
                </span>
                <span style={{ fontSize: 13, color: BRAND.muted, letterSpacing: 1 }}>
                  Tokenized equity · 24/7
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: `${providerColor}22`,
                  border: `1px solid ${providerColor}66`,
                  color: providerColor,
                }}
              >
                {provider}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: BRAND.panel,
                  border: `1px solid ${BRAND.border}`,
                  color: BRAND.body,
                }}
              >
                SOLANA
              </div>
            </div>
          </div>

          {/* Hero row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 8 }}>
            {live?.icon ? (
              <div
                style={{
                  display: 'flex',
                  width: 96,
                  height: 96,
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.panel,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src={live.icon} width={96} height={96} />
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  width: 96,
                  height: 96,
                  borderRadius: 20,
                  background: BRAND.gradient,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BRAND.ink,
                  fontSize: 36,
                  fontWeight: 700,
                }}
              >
                {cleanSymbol.slice(0, 2)}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span
                  style={{
                    fontSize: 72,
                    fontWeight: 700,
                    color: BRAND.body,
                    lineHeight: 1,
                    letterSpacing: -2,
                  }}
                >
                  ${cleanSymbol}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    color: BRAND.muted,
                    fontFamily: '"JetBrains Mono"',
                  }}
                >
                  {token.symbol}
                </span>
              </div>
              <span
                style={{
                  fontSize: 26,
                  color: BRAND.muted,
                  marginTop: 10,
                  fontWeight: 500,
                  fontFamily: '"Space Grotesk Med"',
                }}
              >
                {token.name}
              </span>
            </div>

            {/* Mini spark bars */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 4,
                height: 88,
                paddingBottom: 4,
              }}
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: h,
                    borderRadius: 3,
                    background:
                      i > 16
                        ? isUp
                          ? BRAND.green
                          : BRAND.red
                        : i % 3 === 0
                          ? BRAND.violet
                          : i % 2 === 0
                            ? BRAND.amber
                            : BRAND.gold,
                    opacity: 0.35 + (i / bars.length) * 0.65,
                    display: 'flex',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Price block */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 22,
              marginTop: 22,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 700,
                fontFamily: '"JetBrains Mono"',
                color: BRAND.brandAmber,
                lineHeight: 1,
              }}
            >
              {price}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                borderRadius: 12,
                background: isUp ? 'rgba(0,200,100,0.12)' : 'rgba(220,60,60,0.12)',
                border: `1px solid ${isUp ? 'rgba(0,200,100,0.35)' : 'rgba(220,60,60,0.35)'}`,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono"',
                  color: isUp ? BRAND.green : BRAND.red,
                }}
              >
                {chgStr}
              </span>
              <span style={{ fontSize: 14, color: BRAND.muted, letterSpacing: 1 }}>24H</span>
            </div>
            {premiumStr ? (
              <span
                style={{
                  fontSize: 16,
                  color: BRAND.muted,
                  marginBottom: 12,
                  fontFamily: '"JetBrains Mono"',
                }}
              >
                {premiumStr}
              </span>
            ) : !reliable && stockPrice ? (
              <span style={{ fontSize: 14, color: BRAND.muted, marginBottom: 12, letterSpacing: 2 }}>
                STOCK MARK
              </span>
            ) : null}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              ['ON-CHAIN MCAP', mcap],
              ['LIQUIDITY', liq],
              ['24H VOL', vol],
              ...(stockPrice ? [['UNDERLYING', stockPrice] as const] : []),
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '16px 20px',
                  borderRadius: 14,
                  background: 'rgba(17,17,17,0.92)',
                  border: `1px solid ${BRAND.border}`,
                  minWidth: 150,
                  flex: 1,
                }}
              >
                <span style={{ fontSize: 12, color: BRAND.muted, letterSpacing: 2, fontWeight: 700 }}>
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: BRAND.body,
                    fontFamily: '"JetBrains Mono"',
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: 'auto',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 22,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 120,
                  height: 4,
                  borderRadius: 4,
                  background: BRAND.gradient,
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  color: BRAND.brandAmber,
                  letterSpacing: 0.5,
                  fontWeight: 700,
                }}
              >
                stocksonsolana.com/token/{token.symbol.toLowerCase()}
              </span>
            </div>
            <span style={{ fontSize: 14, color: BRAND.dim, letterSpacing: 1 }}>
              {BRAND.tagline}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Space Grotesk', data: sgBold, weight: 700 },
        { name: 'Space Grotesk Med', data: sgMed, weight: 500 },
        { name: 'JetBrains Mono', data: jbBold, weight: 700 },
      ],
    },
  );
}
