import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ALL_TOKENS } from '@/lib/tokens';
import { discoverTokens } from '@/lib/discover-tokens';

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

export async function generateStaticParams() {
  let tokens;
  try {
    tokens = await discoverTokens();
  } catch {
    tokens = ALL_TOKENS;
  }
  return tokens.map(t => ({ ticker: t.symbol.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const token = findToken(ticker);
  if (!token) return {};

  const title = `${token.name} (${token.symbol}) — Tokenized Stock on Solana`;
  const description = `Trade ${token.name} (${token.symbol}) as a tokenized stock on Solana. Real-time price, liquidity, and discount data. Buy on Jupiter.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://stocksonsolana.com/token/${token.symbol.toLowerCase()}`,
      siteName: 'Stocks on Solana',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://stocksonsolana.com/token/${token.symbol.toLowerCase()}`,
    },
  };
}

// Server component: renders SEO-friendly static shell,
// then JS hydrates into the full screener with modal open
export default async function TokenPage({ params }: Props) {
  const { ticker } = await params;
  const token = findToken(ticker);
  if (!token) notFound();

  const tokenUrl = `https://stocksonsolana.com/token/${token.symbol.toLowerCase()}`;

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: token.name,
      alternateName: token.symbol,
      description: `Trade ${token.name} (${token.symbol}) as a tokenized stock on Solana. Real-time price, liquidity, and discount to real-world price via xStocks, Ondo, or PreStocks.`,
      url: tokenUrl,
      category: token.sector,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        seller: {
          '@type': 'Organization',
          name: 'Stocks on Solana',
          url: 'https://stocksonsolana.com',
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Stocks on Solana',
          item: 'https://stocksonsolana.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: token.sector ?? 'Stocks',
          item: `https://stocksonsolana.com/?sector=${encodeURIComponent(token.sector ?? '')}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${token.name} (${token.symbol})`,
          item: tokenUrl,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      {/* Redirect to home with modal state in URL hash */}
      <meta httpEquiv="refresh" content={`0; url=/?t=${encodeURIComponent(token.symbol)}`} />
      <link rel="canonical" href={`https://stocksonsolana.com/token/${token.symbol.toLowerCase()}`} />
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e8e8e8',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{ fontSize: 13, color: '#555', letterSpacing: 2 }}>STOCKS ON SOLANA</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#ff9900', letterSpacing: 2 }}>{token.symbol}</div>
        <div style={{ fontSize: 14, color: '#888' }}>{token.name}</div>
        <a href={`/?t=${encodeURIComponent(token.symbol)}`}
          style={{ marginTop: 8, color: '#ff9900', fontSize: 11, letterSpacing: 2, textDecoration: 'none' }}>
          → VIEW ON SCREENER
        </a>
      </div>
    </>
  );
}
