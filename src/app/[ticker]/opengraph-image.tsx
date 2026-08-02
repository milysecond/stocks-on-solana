import { ImageResponse } from 'next/og';
import { ALL_TOKENS } from '@/lib/tokens';
import { BRAND } from '@/lib/brand';

export const runtime = 'edge';
export const revalidate = 900;
export const alt = 'Stock on Solana';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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

/** Token OG — brand guide: ink/panel, bare mark, exact gradient, mono numbers */
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
            background: BRAND.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BRAND.muted,
            fontSize: 28,
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
    fetch(new URL('/fonts/SpaceGrotesk-Bold.ttf', BRAND.site)).then((r) => r.arrayBuffer()),
    fetch(new URL('/fonts/JetBrainsMono-Bold.ttf', BRAND.site)).then((r) => r.arrayBuffer()),
    fetch(new URL('/logo-mark.png', BRAND.site)).then((r) => r.arrayBuffer()),
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
  const provider = token.provider === 'Backpack' ? 'SUNRISE' : token.provider.toUpperCase();

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
          overflow: 'hidden',
        }}
      >
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
            flexDirection: 'column',
            flex: 1,
            padding: '44px 56px 40px',
          }}
        >
          {/* Header — bare mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 36,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src={logo} width={44} height={44} />
              <span
                style={{
                  fontSize: 15,
                  letterSpacing: 3,
                  fontWeight: 700,
                  backgroundImage: BRAND.gradient,
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                STOCKS ON SOLANA
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                padding: '7px 14px',
                borderRadius: 4,
                background: BRAND.panel,
                border: `1px solid ${BRAND.border}`,
                color: BRAND.body,
              }}
            >
              {provider}
            </div>
          </div>

          {/* Ticker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 8 }}>
            {live?.icon ? (
              <img src={live.icon} width={72} height={72} style={{ borderRadius: 10 }} />
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span
                  style={{
                    fontSize: 60,
                    fontWeight: 700,
                    color: BRAND.body,
                    lineHeight: 1,
                    letterSpacing: -1,
                  }}
                >
                  {cleanSymbol}
                </span>
                <span style={{ fontSize: 20, color: BRAND.muted, fontFamily: '"JetBrains Mono"' }}>
                  {token.symbol}
                </span>
              </div>
              <span style={{ fontSize: 20, color: BRAND.muted, marginTop: 8 }}>{token.name}</span>
            </div>
          </div>

          {/* Price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              marginTop: 28,
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 52,
                fontWeight: 700,
                fontFamily: '"JetBrains Mono"',
                color: BRAND.brandAmber,
              }}
            >
              {price}
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: '"JetBrains Mono"',
                color: isUp ? BRAND.green : BRAND.red,
              }}
            >
              {`${isUp ? '+' : ''}${chgStr}`.replace('++', '+')}
            </span>
          </div>

          {/* Stats panels */}
          <div style={{ display: 'flex', gap: 12 }}>
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
                  borderRadius: 8,
                  background: BRAND.panel,
                  border: `1px solid ${BRAND.border}`,
                  minWidth: 150,
                }}
              >
                <span style={{ fontSize: 11, color: BRAND.muted, letterSpacing: 2 }}>{label}</span>
                <span
                  style={{
                    fontSize: 24,
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

          <div
            style={{
              display: 'flex',
              marginTop: 'auto',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: BRAND.brandAmber, letterSpacing: 1, fontWeight: 600 }}>
              {`stocksonsolana.com/token/${token.symbol.toLowerCase()}`}
            </span>
            <span style={{ fontSize: 12, color: BRAND.dim }}>Design by Gray</span>
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
