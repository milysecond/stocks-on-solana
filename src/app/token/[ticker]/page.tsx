import type { CSSProperties } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_TOKENS, getFlashTradeUrl, getBackpackTradeUrl, type StockToken } from '@/lib/tokens';
import { discoverTokens } from '@/lib/discover-tokens';

interface Props {
  params: Promise<{ ticker: string }>;
}

async function resolveToken(ticker: string): Promise<StockToken | undefined> {
  const slug = decodeURIComponent(ticker).toLowerCase();
  const match = (list: StockToken[]) =>
    list.find(
      t =>
        t.symbol.toLowerCase() === slug ||
        t.symbol.toLowerCase().replace(/[xon]+$/, '') === slug ||
        t.name.toLowerCase().replace(/\s+/g, '-') === slug
    );

  const staticHit = match(ALL_TOKENS);
  if (staticHit) return staticHit;

  try {
    const discovered = await discoverTokens();
    return match(discovered);
  } catch {
    return undefined;
  }
}

export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render xStocks to stay within CF Pages limits; rest on-demand
  const { XSTOCKS } = await import('@/lib/tokens');
  return XSTOCKS.map(t => ({ ticker: t.symbol.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const token = await resolveToken(ticker);
  if (!token) return { title: 'Token Not Found' };

  const slug = token.symbol.toLowerCase();
  const title = `${token.name} (${token.symbol}) — Tokenized Stock on Solana`;
  const description = `Trade ${token.name} (${token.symbol}) as a tokenized stock on Solana via ${token.provider}. Real-time price, liquidity, and discount vs the real stock. Buy on Jupiter.`;
  const url = `https://stocksonsolana.com/token/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Stocks on Solana',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@StocksOnSolana',
      creator: '@StocksOnSolana',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Server-rendered indexable token page (no soft redirect / meta refresh).
// Soft redirects were the primary reason GSC had 587 submitted / 0 token pages indexed.
export default async function TokenPage({ params }: Props) {
  const { ticker } = await params;
  const token = await resolveToken(ticker);
  if (!token) notFound();

  const slug = token.symbol.toLowerCase();
  const tokenUrl = `https://stocksonsolana.com/token/${encodeURIComponent(slug)}`;
  const screenerUrl = `/?t=${encodeURIComponent(token.symbol)}`;
  const jupUrl = `https://jup.ag/tokens/${token.mint}?ref=yfgv2ibxy07v`;
  const flashUrl = getFlashTradeUrl(token);
  const backpackUrl = getBackpackTradeUrl(token);
  const shortMint = `${token.mint.slice(0, 4)}…${token.mint.slice(-4)}`;
  const underlying = token.company || token.symbol.replace(/x$|on$/i, '').toUpperCase();

  const related = ALL_TOKENS.filter(
    t => t.sector === token.sector && t.symbol !== token.symbol
  ).slice(0, 8);

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: `${token.name} (${token.symbol})`,
      alternateName: [token.symbol, underlying],
      description: `Tokenized version of ${token.name} traded on Solana via ${token.provider}. Track price, liquidity, and discount vs the real-world stock on Stocks on Solana.`,
      url: tokenUrl,
      category: token.sector ?? 'Tokenized Equity',
      brand: {
        '@type': 'Brand',
        name: token.provider,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: jupUrl,
        seller: {
          '@type': 'Organization',
          name: 'Stocks on Solana',
          url: 'https://stocksonsolana.com',
        },
      },
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'blockchain', value: 'Solana' },
        { '@type': 'PropertyValue', name: 'mint', value: token.mint },
        { '@type': 'PropertyValue', name: 'provider', value: token.provider },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Stocks on Solana',
          item: 'https://stocksonsolana.com/',
        },
        ...(token.sector
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: token.sector,
                item: `https://stocksonsolana.com/?sector=${encodeURIComponent(token.sector)}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: token.sector ? 3 : 2,
          name: `${token.name} (${token.symbol})`,
          item: tokenUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `What is ${token.symbol} on Solana?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${token.symbol} is a tokenized version of ${token.name} issued by ${token.provider} and tradeable on Solana. It tracks the real-world equity while settling on-chain.`,
          },
        },
        {
          '@type': 'Question',
          name: `How do I buy ${token.symbol}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `You can buy ${token.symbol} on Jupiter using a Solana wallet. Open the live screener on Stocks on Solana for price, liquidity, and a direct trade link.`,
          },
        },
        {
          '@type': 'Question',
          name: `Is ${token.symbol} the same as owning ${token.name} stock?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Tokenized stocks like ${token.symbol} are on-chain representations issued by ${token.provider}. They are not traditional broker-held shares and carry crypto and smart-contract risk. This is not financial advice.`,
          },
        },
      ],
    },
  ];

  const mono: CSSProperties = {
    fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main
        style={{
          ...mono,
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#e8e8e8',
          padding: '40px 24px 80px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <nav style={{ marginBottom: 32, fontSize: 12, letterSpacing: 1 }}>
            <a href="/" style={{ color: '#ff9900', textDecoration: 'none' }}>
              ← Stocks on Solana
            </a>
            {token.sector && (
              <>
                <span style={{ color: '#444', margin: '0 8px' }}>/</span>
                <a
                  href={`/?sector=${encodeURIComponent(token.sector)}`}
                  style={{ color: '#888', textDecoration: 'none' }}
                >
                  {token.sector}
                </a>
              </>
            )}
          </nav>

          <p
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: '#555',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Tokenized stock · {token.provider}
          </p>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#ff9900',
              letterSpacing: 1,
              margin: '0 0 8px',
              lineHeight: 1.15,
            }}
          >
            {token.name}{' '}
            <span style={{ color: '#e8e8e8' }}>({token.symbol})</span>
          </h1>

          <p style={{ fontSize: 15, color: '#aaa', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 560 }}>
            Trade {token.name} as a tokenized equity on Solana via {token.provider}.
            Track live price, 24h change, liquidity, and discount versus the real-world{' '}
            {underlying} stock on the Stocks on Solana screener.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 36,
            }}
          >
            <a
              href={screenerUrl}
              style={{
                display: 'inline-block',
                padding: '12px 22px',
                background: '#ff9900',
                color: '#0a0a0a',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 4,
              }}
            >
              Open in Screener
            </a>
            <a
              href={jupUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 22px',
                border: '1px solid #ff9900',
                color: '#ff9900',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 4,
              }}
            >
              Buy on Jupiter
            </a>
            {flashUrl && (
              <a
                href={flashUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={secondaryBtn}
              >
                Trade on Flash
              </a>
            )}
            {backpackUrl && (
              <a
                href={backpackUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={secondaryBtn}
              >
                Trade on Backpack
              </a>
            )}
          </div>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 40,
            }}
          >
            {[
              { label: 'Provider', value: token.provider },
              { label: 'Sector', value: token.sector ?? '—' },
              { label: 'Underlying', value: underlying },
              { label: 'Chain', value: 'Solana' },
              { label: 'Mint', value: shortMint },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  border: '1px solid #1f1f1f',
                  borderRadius: 6,
                  padding: '14px 16px',
                  background: '#111',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 2,
                    color: '#555',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 14, color: '#e8e8e8', wordBreak: 'break-all' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={h2}>About {token.symbol}</h2>
            <p style={body}>
              {token.symbol} is a tokenized stock representing {token.name}, issued by{' '}
              {token.provider} and tradeable 24/7 on Solana. Unlike traditional brokerage
              hours, on-chain markets can price these assets around the clock. Use Stocks on
              Solana to compare the on-chain price with the real-world {underlying} quote and
              spot discounts or premiums.
            </p>
            <p style={body}>
              Full mint address:{' '}
              <code style={{ color: '#ff9900', fontSize: 12, wordBreak: 'break-all' }}>
                {token.mint}
              </code>
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={h2}>How to trade {token.symbol}</h2>
            <ol style={{ ...body, paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 10 }}>
                Connect a Solana wallet (Phantom, Backpack, Solflare, or any wallet-standard
                wallet).
              </li>
              <li style={{ marginBottom: 10 }}>
                Open the{' '}
                <a href={screenerUrl} style={{ color: '#ff9900' }}>
                  live screener
                </a>{' '}
                for current price, liquidity, and 24h volume.
              </li>
              <li style={{ marginBottom: 10 }}>
                Buy or sell via{' '}
                <a href={jupUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff9900' }}>
                  Jupiter
                </a>
                {flashUrl ? (
                  <>
                    {' '}
                    or trade perps on{' '}
                    <a href={flashUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff9900' }}>
                      Flash Trade
                    </a>
                  </>
                ) : null}
                .
              </li>
            </ol>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={h2}>FAQ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={h3}>What is {token.symbol} on Solana?</h3>
                <p style={body}>
                  {token.symbol} is a tokenized version of {token.name} from {token.provider}.
                  It trades as an SPL token on Solana and is designed to track the real-world
                  equity.
                </p>
              </div>
              <div>
                <h3 style={h3}>How do I buy {token.symbol}?</h3>
                <p style={body}>
                  Use Jupiter with a Solana wallet, or open the Stocks on Solana screener for a
                  direct trade link with live market data.
                </p>
              </div>
              <div>
                <h3 style={h3}>Is this the same as owning {token.name} shares?</h3>
                <p style={body}>
                  No. Tokenized equities are on-chain products with different custody, rights,
                  and risks than broker-held shares. This site is informational only and not
                  financial advice.
                </p>
              </div>
            </div>
          </section>

          {related.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={h2}>Related {token.sector} tokens</h2>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 8,
                }}
              >
                {related.map(t => (
                  <li key={t.mint}>
                    <a
                      href={`/token/${encodeURIComponent(t.symbol.toLowerCase())}`}
                      style={{
                        display: 'block',
                        padding: '10px 12px',
                        border: '1px solid #1f1f1f',
                        borderRadius: 4,
                        color: '#ccc',
                        textDecoration: 'none',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: '#ff9900', fontWeight: 700 }}>{t.symbol}</span>
                      <br />
                      <span style={{ color: '#666', fontSize: 11 }}>{t.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p style={{ fontSize: 11, color: '#444', lineHeight: 1.5 }}>
            Not financial advice. Tokenized stocks involve smart-contract, liquidity, and
            regulatory risk. Always do your own research.
          </p>
        </div>
      </main>
    </>
  );
}

const secondaryBtn: CSSProperties = {
  display: 'inline-block',
  padding: '12px 22px',
  border: '1px solid #333',
  color: '#ccc',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  textDecoration: 'none',
  borderRadius: 4,
};

const h2: CSSProperties = {
  fontSize: 14,
  letterSpacing: 2,
  color: '#ff9900',
  textTransform: 'uppercase',
  margin: '0 0 14px',
};

const h3: CSSProperties = {
  fontSize: 13,
  color: '#e8e8e8',
  margin: '0 0 6px',
  fontWeight: 700,
};

const body: CSSProperties = {
  fontSize: 14,
  color: '#999',
  lineHeight: 1.65,
  margin: '0 0 12px',
};
