import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ALL_TOKENS } from '@/lib/tokens';

interface Props {
  params: Promise<{ ticker: string }>;
}

// Reserved app routes — don't treat as tickers
const RESERVED = new Set(['privacy', 'terms', 'partners', 'api', 'dashboard', 'token', 'sitemap.xml', 'robots.txt']);

function findToken(ticker: string) {
  const slug = ticker.toLowerCase();
  return ALL_TOKENS.find(t =>
    t.symbol.toLowerCase() === slug ||
    t.symbol.toLowerCase().replace(/[xon]+$/, '') === slug
  );
}

export async function generateStaticParams() {
  return ALL_TOKENS.map(t => ({ ticker: t.symbol.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  if (RESERVED.has(ticker.toLowerCase())) return {};
  const token = findToken(ticker);
  if (!token) return {};

  const title = `${token.name} (${token.symbol}) — Tokenized Stock on Solana`;
  const description = `Trade ${token.name} (${token.symbol}) as a tokenized stock on Solana. Real-time price, 24h change, liquidity, and discount vs real stock. Buy on Jupiter.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `https://stocksonsolana.com/${token.symbol.toLowerCase()}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, site: '@stocksonsolana' },
    alternates: { canonical: `https://stocksonsolana.com/${token.symbol.toLowerCase()}` },
  };
}

export default async function TickerPage({ params }: Props) {
  const { ticker } = await params;

  if (RESERVED.has(ticker.toLowerCase())) notFound();

  const token = findToken(ticker);
  if (!token) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: token.name,
    alternateName: token.symbol,
    description: `Tokenized version of ${token.name} on Solana blockchain`,
    url: `https://stocksonsolana.com/${token.symbol.toLowerCase()}`,
    category: token.sector,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      seller: { '@type': 'Organization', name: 'Stocks on Solana', url: 'https://stocksonsolana.com' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <meta httpEquiv="refresh" content={`0; url=/?t=${encodeURIComponent(token.symbol)}`} />
      <link rel="canonical" href={`https://stocksonsolana.com/${token.symbol.toLowerCase()}`} />
      <div style={{
        minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8',
        fontFamily: 'monospace', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 13, color: '#555', letterSpacing: 2 }}>STOCKS ON SOLANA</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#ff9900', letterSpacing: 3 }}>{token.symbol}</div>
        <div style={{ fontSize: 14, color: '#888' }}>{token.name}</div>
        <a href={`/?t=${token.symbol}`} style={{ marginTop: 8, color: '#ff9900', fontSize: 11, letterSpacing: 2, textDecoration: 'none' }}>
          → VIEW ON SCREENER
        </a>
      </div>
    </>
  );
}
