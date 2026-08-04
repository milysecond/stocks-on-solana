import type { CSSProperties } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ALL_TOKENS,
  getFlashTradeUrl,
  getBackpackTradeUrl,
  getJupiterTradeUrl,
  getXStocksTradeUrl,
} from '@/lib/tokens';
import { resolveToken, tokenShareUrl } from '@/lib/resolve-token';
import { fetchScreenerPrices } from '@/lib/discover-tokens';
import TokenDetailClient from '@/components/TokenDetailClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

interface Props {
  params: Promise<{ ticker: string }>;
  searchParams?: Promise<{ mint?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const sp = searchParams ? await searchParams : {};
  const token = await resolveToken(ticker, sp.mint);
  if (!token) return { title: 'Token Not Found' };

  const title = `${token.name} (${token.symbol}) — Tokenized Stock on Solana`;
  const description = `Trade ${token.name} (${token.symbol}) as a tokenized stock on Solana via ${token.provider}. Live price, chart, CA, liquidity. Buy on Jupiter.`;
  const url = tokenShareUrl(token);

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
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default async function TokenPage({ params, searchParams }: Props) {
  const { ticker } = await params;
  const sp = searchParams ? await searchParams : {};
  const token = await resolveToken(ticker, sp.mint);
  if (!token) notFound();

  const slug = token.symbol.toLowerCase();
  const tokenUrl = tokenShareUrl(token);
  const screenerUrl = `/?t=${encodeURIComponent(token.symbol)}&mint=${encodeURIComponent(token.mint)}`;
  const jupUrl = getJupiterTradeUrl(token);
  const xstocksUrl = getXStocksTradeUrl(token);
  const flashUrl = getFlashTradeUrl(token);
  const backpackUrl = getBackpackTradeUrl(token);
  const underlying =
    token.company || token.symbol.replace(/pre$/i, '').replace(/on$/i, '').replace(/x$/i, '').toUpperCase();

  // Live prices for SSR
  let initial = {
    price: null as number | null,
    change24h: null as number | null,
    volume24h: null as number | null,
    liquidity: null as number | null,
    stockPrice: null as number | null,
    mcap: null as number | null,
    underlyingMcap: null as number | null,
    icon: `/api/token-icon?mint=${encodeURIComponent(token.mint)}&symbol=${encodeURIComponent(token.symbol)}` as string | null,
  };
  try {
    const prices = await fetchScreenerPrices();
    const row = prices[token.mint];
    if (row) {
      initial = { ...initial, ...row };
    }
  } catch {
    /* keep nulls */
  }

  const related = ALL_TOKENS.filter(
    (t) => t.sector === token.sector && t.symbol !== token.symbol,
  ).slice(0, 8);

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: `${token.name} (${token.symbol})`,
      alternateName: [token.symbol, underlying],
      description: `Tokenized version of ${token.name} traded on Solana via ${token.provider}.`,
      url: tokenUrl,
      category: token.sector ?? 'Tokenized Equity',
      brand: { '@type': 'Brand', name: token.provider },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        ...(initial.price != null ? { price: initial.price } : {}),
        availability: 'https://schema.org/InStock',
        url: jupUrl,
      },
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'blockchain', value: 'Solana' },
        { '@type': 'PropertyValue', name: 'mint', value: token.mint },
        { '@type': 'PropertyValue', name: 'provider', value: token.provider },
      ],
    },
  ];

  const mono: CSSProperties = {
    fontFamily: 'var(--font-sans), "Space Grotesk", system-ui, sans-serif',
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
          padding: '32px 20px 80px',
        }}
      >
        <TokenDetailClient
          symbol={token.symbol}
          name={token.name}
          mint={token.mint}
          provider={token.provider}
          sector={token.sector}
          company={token.company}
          underlying={underlying}
          jupUrl={jupUrl}
          xstocksUrl={xstocksUrl}
          flashUrl={flashUrl}
          backpackUrl={backpackUrl}
          screenerUrl={screenerUrl}
          initial={initial}
        />

        {related.length > 0 && (
          <section style={{ maxWidth: 860, margin: '40px auto 0' }}>
            <h2
              style={{
                fontSize: 13,
                letterSpacing: 2,
                color: '#ffb000',
                margin: '0 0 12px',
              }}
            >
              RELATED {token.sector?.toUpperCase() || ''} TOKENS
            </h2>
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
              {related.map((t) => (
                <li key={t.mint}>
                  <a
                    href={`/token/${encodeURIComponent(t.symbol.toLowerCase())}?mint=${encodeURIComponent(t.mint)}`}
                    style={{
                      display: 'block',
                      padding: '10px 12px',
                      border: '1px solid #1f1f1f',
                      borderRadius: 8,
                      color: '#ccc',
                      textDecoration: 'none',
                      fontSize: 13,
                      background: '#111',
                    }}
                  >
                    <span style={{ color: '#ffb000', fontWeight: 700 }}>{t.symbol}</span>
                    <br />
                    <span style={{ color: '#666', fontSize: 11 }}>{t.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
