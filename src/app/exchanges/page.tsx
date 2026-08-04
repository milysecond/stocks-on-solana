import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
  title: 'Exchanges — Trade Stocks on Solana Worldwide',
  description:
    'Every venue to trade tokenized stocks on Solana — Jupiter, Backpack, Flash, xStocks — plus the world equity exchanges those assets track (NYSE, NASDAQ, LSE, TSE, HKEX and more).',
  alternates: { canonical: 'https://stocksonsolana.com/exchanges' },
  openGraph: {
    title: 'Exchanges — Stocks on Solana',
    description:
      'Solana trading venues and the global stock exchanges behind tokenized equities.',
    url: 'https://stocksonsolana.com/exchanges',
    siteName: 'Stocks on Solana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exchanges — Stocks on Solana',
    description: 'Where to trade tokenized stocks on Solana, and the world markets they track.',
    site: '@StocksOnSolana',
  },
};

type Venue = {
  name: string;
  kind: 'solana' | 'issuer' | 'world';
  blurb: string;
  url: string;
  logo?: string;
  color?: string;
  region?: string;
  tag?: string;
  referral?: boolean;
};

const SOLANA_VENUES: Venue[] = [
  {
    name: 'Jupiter',
    kind: 'solana',
    blurb: 'Leading Solana aggregator. Best-route swaps for every tokenized stock mint.',
    url: 'https://jup.ag/?ref=yfgv2ibxy07v',
    logo: '/partners/jupiter.png',
    color: '#c7f284',
    tag: 'DEX AGGREGATOR',
    referral: true,
  },
  {
    name: 'Backpack Exchange',
    kind: 'solana',
    blurb: 'Regulated exchange + Sunrise tokenized US equities. Spot markets with deep books.',
    url: 'https://backpack.exchange/signup?referral=downunder',
    logo: '/partners/backpack.png',
    color: '#e33e3e',
    tag: 'CEX · SUNRISE',
    referral: true,
  },
  {
    name: 'Flash Trade',
    kind: 'solana',
    blurb: 'Perpetual futures on Solana equities — leverage on NVDA, TSLA, AAPL and more.',
    url: 'https://www.flash.trade?referral=newuser',
    logo: '/partners/flash.png',
    color: '#ff3b3b',
    tag: 'PERPS',
    referral: true,
  },
  {
    name: 'xStocks (Backed)',
    kind: 'solana',
    blurb: 'Trade and redeem xStocks tokenized equities. Instant on-chain settlement.',
    url: 'https://defi.xstocks.fi/points?ref=NEWUSER',
    logo: '/partners/xstocks.png',
    color: '#00c2ff',
    tag: 'xSTOCKS APP',
    referral: true,
  },
  {
    name: 'Raydium',
    kind: 'solana',
    blurb: 'Solana AMM — many tokenized stock pools route through Raydium liquidity.',
    url: 'https://raydium.io/swap/',
    color: '#c4a4ff',
    tag: 'AMM',
  },
  {
    name: 'Orca',
    kind: 'solana',
    blurb: 'Concentrated liquidity DEX on Solana. Spot swaps for SPL equity tokens.',
    url: 'https://www.orca.so/',
    color: '#fff',
    tag: 'CLMM',
  },
  {
    name: 'Meteora',
    kind: 'solana',
    blurb: 'Dynamic liquidity pools on Solana powering routes for RWA and equity tokens.',
    url: 'https://app.meteora.ag/',
    color: '#7dd3fc',
    tag: 'DLMM',
  },
  {
    name: 'Phoenix',
    kind: 'solana',
    blurb: 'On-chain CLOB for spot markets — institutional-grade Solana order books.',
    url: 'https://www.ellipsis.trade/',
    color: '#fbbf24',
    tag: 'CLOB',
  },
];

const ISSUERS: Venue[] = [
  {
    name: 'Sunrise (Backpack Securities)',
    kind: 'issuer',
    blurb: 'Tokenized US equities issued via Backpack Securities — redeemable 1:1 path.',
    url: 'https://backpack.exchange/signup?referral=downunder',
    logo: '/partners/backpack.png',
    color: '#e33e3e',
    tag: 'ISSUER',
    referral: true,
  },
  {
    name: 'xStocks',
    kind: 'issuer',
    blurb: 'Broad suite of tokenized blue-chips and ETFs as Solana SPL tokens.',
    url: 'https://defi.xstocks.fi/points?ref=NEWUSER',
    logo: '/partners/xstocks.png',
    color: '#00c2ff',
    tag: 'ISSUER',
    referral: true,
  },
  {
    name: 'Ondo Global Markets',
    kind: 'issuer',
    blurb: 'Tokenized stocks and funds on Solana via Ondo — deep issuer coverage.',
    url: 'https://ondo.finance',
    logo: '/partners/ondo.png',
    color: '#6c5ce7',
    tag: 'ISSUER',
  },
  {
    name: 'PreStocks',
    kind: 'issuer',
    blurb: 'Pre-IPO and private-market tokenized exposure on Solana.',
    url: 'https://prestocks.com',
    logo: '/partners/prestocks.png',
    color: '#a855f7',
    tag: 'ISSUER',
  },
  {
    name: 'Superstate',
    kind: 'issuer',
    blurb: 'Regulated on-chain funds and tokenized securities infrastructure.',
    url: 'https://superstate.com',
    color: '#ffb000',
    tag: 'ISSUER',
  },
  {
    name: 'Shift',
    kind: 'issuer',
    blurb: 'Tokenized equity products available in the Solana stocks universe.',
    url: 'https://www.shiftprotocol.xyz/',
    color: '#fbae17',
    tag: 'ISSUER',
  },
];

/** Major world equity exchanges — markets that tokenized stocks track */
const WORLD_EXCHANGES: Venue[] = [
  { name: 'NYSE', kind: 'world', region: 'Americas', blurb: 'New York Stock Exchange — the world’s largest equity exchange by market cap.', url: 'https://www.nyse.com', tag: 'US', color: '#5b8def' },
  { name: 'NASDAQ', kind: 'world', region: 'Americas', blurb: 'Tech-heavy US exchange home to Apple, Microsoft, NVIDIA, Tesla and more.', url: 'https://www.nasdaq.com', tag: 'US', color: '#0a1f44' },
  { name: 'CBOE', kind: 'world', region: 'Americas', blurb: 'Options and equities venue; VIX and US listed products.', url: 'https://www.cboe.com', tag: 'US', color: '#00a3e0' },
  { name: 'TSX', kind: 'world', region: 'Americas', blurb: 'Toronto Stock Exchange — Canada’s senior equity market.', url: 'https://www.tsx.com', tag: 'CA', color: '#e31837' },
  { name: 'B3', kind: 'world', region: 'Americas', blurb: 'Brasil Bolsa Balcão — Latin America’s largest exchange group.', url: 'https://www.b3.com.br', tag: 'BR', color: '#00a859' },
  { name: 'BMV', kind: 'world', region: 'Americas', blurb: 'Bolsa Mexicana de Valores — Mexico’s primary stock exchange.', url: 'https://www.bmv.com.mx', tag: 'MX', color: '#006847' },

  { name: 'LSE', kind: 'world', region: 'EMEA', blurb: 'London Stock Exchange — Europe’s leading international equity market.', url: 'https://www.londonstockexchange.com', tag: 'UK', color: '#0033a0' },
  { name: 'Euronext', kind: 'world', region: 'EMEA', blurb: 'Pan-European exchange (Paris, Amsterdam, Brussels, Lisbon, Dublin, Oslo).', url: 'https://www.euronext.com', tag: 'EU', color: '#e30613' },
  { name: 'Deutsche Börse', kind: 'world', region: 'EMEA', blurb: 'Frankfurt Xetra — Germany’s primary cash equity market.', url: 'https://www.deutsche-boerse.com', tag: 'DE', color: '#0018a8' },
  { name: 'SIX Swiss', kind: 'world', region: 'EMEA', blurb: 'Swiss Exchange — home of Nestlé, Roche, Novartis and the SMI.', url: 'https://www.six-group.com/en/products-services/the-swiss-stock-exchange.html', tag: 'CH', color: '#e30613' },
  { name: 'Borsa Italiana', kind: 'world', region: 'EMEA', blurb: 'Milan equity market, part of Euronext group.', url: 'https://www.borsaitaliana.it', tag: 'IT', color: '#009246' },
  { name: 'BME', kind: 'world', region: 'EMEA', blurb: 'Bolsas y Mercados Españoles — Spanish equity markets.', url: 'https://www.bolsasymercados.es', tag: 'ES', color: '#c60b1e' },
  { name: 'Nasdaq Stockholm', kind: 'world', region: 'EMEA', blurb: 'Nordic equities — Sweden and regional listings.', url: 'https://www.nasdaq.com/solutions/nasdaq-nordic', tag: 'SE', color: '#003366' },
  { name: 'JSE', kind: 'world', region: 'EMEA', blurb: 'Johannesburg Stock Exchange — Africa’s largest equity market.', url: 'https://www.jse.co.za', tag: 'ZA', color: '#007a4d' },
  { name: 'TADAWUL', kind: 'world', region: 'EMEA', blurb: 'Saudi Exchange — Middle East’s deepest equity market.', url: 'https://www.saudiexchange.sa', tag: 'SA', color: '#006c35' },
  { name: 'TASE', kind: 'world', region: 'EMEA', blurb: 'Tel Aviv Stock Exchange — Israel’s primary market.', url: 'https://www.tase.co.il', tag: 'IL', color: '#0038b8' },

  { name: 'TSE / JPX', kind: 'world', region: 'APAC', blurb: 'Tokyo Stock Exchange — Japan’s main board (Nikkei, TOPIX).', url: 'https://www.jpx.co.jp', tag: 'JP', color: '#bc002d' },
  { name: 'HKEX', kind: 'world', region: 'APAC', blurb: 'Hong Kong Exchanges — gateway for China and Asia listings.', url: 'https://www.hkex.com.hk', tag: 'HK', color: '#0066b3' },
  { name: 'SSE', kind: 'world', region: 'APAC', blurb: 'Shanghai Stock Exchange — A-shares and China blue chips.', url: 'https://www.sse.com.cn', tag: 'CN', color: '#de2910' },
  { name: 'SZSE', kind: 'world', region: 'APAC', blurb: 'Shenzhen Stock Exchange — growth and tech A-shares.', url: 'https://www.szse.cn', tag: 'CN', color: '#de2910' },
  { name: 'KRX', kind: 'world', region: 'APAC', blurb: 'Korea Exchange — KOSPI and KOSDAQ markets.', url: 'https://www.krx.co.kr', tag: 'KR', color: '#003478' },
  { name: 'TWSE', kind: 'world', region: 'APAC', blurb: 'Taiwan Stock Exchange — TSMC and electronics supply chain.', url: 'https://www.twse.com.tw', tag: 'TW', color: '#fe0000' },
  { name: 'SGX', kind: 'world', region: 'APAC', blurb: 'Singapore Exchange — ASEAN and regional listings.', url: 'https://www.sgx.com', tag: 'SG', color: '#e31c23' },
  { name: 'ASX', kind: 'world', region: 'APAC', blurb: 'Australian Securities Exchange — equities and ETFs down under.', url: 'https://www.asx.com.au', tag: 'AU', color: '#00008b' },
  { name: 'NSE India', kind: 'world', region: 'APAC', blurb: 'National Stock Exchange of India — Nifty 50 and India growth.', url: 'https://www.nseindia.com', tag: 'IN', color: '#ff9933' },
  { name: 'BSE', kind: 'world', region: 'APAC', blurb: 'Bombay Stock Exchange — Asia’s oldest stock exchange.', url: 'https://www.bseindia.com', tag: 'IN', color: '#138808' },
  { name: 'SET', kind: 'world', region: 'APAC', blurb: 'Stock Exchange of Thailand — Bangkok equities.', url: 'https://www.set.or.th', tag: 'TH', color: '#a51931' },
  { name: 'IDX', kind: 'world', region: 'APAC', blurb: 'Indonesia Stock Exchange — Jakarta listed companies.', url: 'https://www.idx.co.id', tag: 'ID', color: '#ff0000' },
];

export default function ExchangesPage() {
  const regions = ['Americas', 'EMEA', 'APAC'] as const;

  return (
    <main style={page}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={brandBar} />
        <a href="/" style={back}>
          ← BACK
        </a>

        <h1 style={h1}>Exchanges</h1>
        <p style={lead}>
          Where tokenized stocks trade on <strong style={{ color: '#e8e8e8' }}>Solana</strong> — and the{' '}
          <strong style={{ color: '#e8e8e8' }}>world equity exchanges</strong> those assets track.
        </p>

        {/* Jump nav */}
        <div style={jumpRow}>
          <a href="#solana" style={jumpChip}>
            Solana venues
          </a>
          <a href="#issuers" style={jumpChip}>
            Issuers
          </a>
          <a href="#world" style={jumpChip}>
            World exchanges
          </a>
        </div>

        {/* SOLANA */}
        <section id="solana" style={section}>
          <h2 style={h2}>Trade on Solana</h2>
          <p style={sectionLead}>
            Spot, perps, and aggregation venues for tokenized equities. Referral links support Stocks on
            Solana where available.
          </p>
          <div style={grid}>
            {SOLANA_VENUES.map((v) => (
              <VenueCard key={v.name} v={v} />
            ))}
          </div>
        </section>

        {/* ISSUERS */}
        <section id="issuers" style={section}>
          <h2 style={h2}>Issuers & protocols</h2>
          <p style={sectionLead}>
            Who wraps the equity as an on-chain token. Filter the screener by provider to see each book.
          </p>
          <div style={grid}>
            {ISSUERS.map((v) => (
              <VenueCard key={v.name} v={v} />
            ))}
          </div>
        </section>

        {/* WORLD */}
        <section id="world" style={section}>
          <h2 style={h2}>World equity exchanges</h2>
          <p style={sectionLead}>
            Traditional markets that tokenized stocks reference. Hours, holidays, and cash indices still
            matter for underlying marks — even when Solana never sleeps.
          </p>

          {regions.map((region) => {
            const list = WORLD_EXCHANGES.filter((e) => e.region === region);
            return (
              <div key={region} style={{ marginBottom: 28 }}>
                <h3 style={h3}>{region}</h3>
                <div style={grid}>
                  {list.map((v) => (
                    <VenueCard key={v.name} v={v} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <div style={ctaBox}>
          <div style={{ fontSize: 12, color: '#888', letterSpacing: 1, marginBottom: 12 }}>
            LIVE SCREENER
          </div>
          <a href="/" style={cta}>
            Open Stocks on Solana →
          </a>
        </div>

        <p style={disclaimer}>
          Informational only — not financial advice. Exchange listings change; always verify venue status,
          jurisdiction, and eligibility before trading.
        </p>
      </div>
    </main>
  );
}

function VenueCard({ v, compact }: { v: Venue; compact?: boolean }) {
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...card,
        padding: compact ? '14px 16px' : '18px 18px',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {v.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.logo}
            alt=""
            width={compact ? 28 : 36}
            height={compact ? 28 : 36}
            style={{ objectFit: 'contain', flexShrink: 0, marginTop: 2 }}
          />
        ) : (
          <div
            style={{
              width: compact ? 28 : 36,
              height: compact ? 28 : 36,
              borderRadius: 8,
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              color: v.color || '#ffb000',
              flexShrink: 0,
              letterSpacing: 0.5,
            }}
          >
            {(v.tag || v.name).slice(0, 3)}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span
              style={{
                fontSize: compact ? 14 : 16,
                fontWeight: 800,
                color: v.color || '#ffb000',
                letterSpacing: 0.3,
              }}
            >
              {v.name}
            </span>
            {v.tag ? <span style={tagPill}>{v.tag}</span> : null}
            {v.referral ? <span style={{ ...tagPill, color: '#888', borderColor: '#333' }}>REF</span> : null}
          </div>
          <div style={{ fontSize: 12, color: '#777', lineHeight: 1.55 }}>{v.blurb}</div>
        </div>
      </div>
    </a>
  );
}

const page: CSSProperties = {
  minHeight: '100vh',
  background: '#0a0a0a',
  color: '#e8e8e8',
  fontFamily: 'var(--font-sans), "Space Grotesk", system-ui, sans-serif',
  padding: '48px 20px 80px',
};

const brandBar: CSSProperties = {
  height: 3,
  width: '100%',
  marginBottom: 28,
  borderRadius: 2,
  background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
};

const back: CSSProperties = {
  color: '#555',
  textDecoration: 'none',
  fontSize: 11,
  letterSpacing: 2,
};

const h1: CSSProperties = {
  fontSize: 34,
  fontWeight: 800,
  letterSpacing: 0.5,
  marginTop: 24,
  marginBottom: 12,
  background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const lead: CSSProperties = {
  fontSize: 15,
  color: '#888',
  lineHeight: 1.65,
  maxWidth: 640,
  marginBottom: 24,
};

const jumpRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 40,
};

const jumpChip: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  color: '#ffb000',
  border: '1px solid rgba(255,176,0,0.35)',
  borderRadius: 999,
  padding: '8px 14px',
  textDecoration: 'none',
  background: 'rgba(255,176,0,0.06)',
};

const section: CSSProperties = { marginBottom: 48 };

const h2: CSSProperties = {
  fontSize: 13,
  letterSpacing: 2,
  color: '#ffb000',
  margin: '0 0 10px',
  textTransform: 'uppercase',
};

const h3: CSSProperties = {
  fontSize: 12,
  letterSpacing: 2,
  color: '#888',
  margin: '0 0 12px',
  textTransform: 'uppercase',
};

const sectionLead: CSSProperties = {
  fontSize: 13,
  color: '#666',
  lineHeight: 1.6,
  marginBottom: 18,
  maxWidth: 640,
};

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 12,
};

const card: CSSProperties = {
  display: 'block',
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: 12,
  textDecoration: 'none',
  transition: 'border-color 0.15s',
};

const tagPill: CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1,
  color: '#aaa',
  border: '1px solid #2a2a2a',
  borderRadius: 999,
  padding: '2px 8px',
};

const ctaBox: CSSProperties = {
  marginTop: 16,
  padding: 28,
  border: '1px dashed #2a2a2a',
  borderRadius: 12,
  textAlign: 'center',
};

const cta: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 1,
  color: '#0a0a0a',
  background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
  textDecoration: 'none',
  padding: '12px 22px',
  borderRadius: 8,
  display: 'inline-block',
};

const disclaimer: CSSProperties = {
  marginTop: 36,
  fontSize: 11,
  color: '#444',
  lineHeight: 1.5,
};
