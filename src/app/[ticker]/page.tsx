import { permanentRedirect, notFound } from 'next/navigation';
import { resolveToken, tokenSharePath } from '@/lib/resolve-token';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ ticker: string }>;
  searchParams?: Promise<{ mint?: string }>;
}

// Reserved app routes — don't treat as tickers
const RESERVED = new Set([
  'privacy',
  'terms',
  'partners',
  'brand',
  'press',
  'exchanges',
  'api',
  'dashboard',
  'token',
  'sitemap.xml',
  'robots.txt',
  'flash',
  'opengraph-image',
  'twitter-image',
  'favicon.ico',
]);

/**
 * Short /TICKER URLs permanently redirect to /token/TICKER?mint=…
 * so tweets and shares hit a single canonical path that always resolves.
 */
export default async function TickerRedirectPage({ params, searchParams }: Props) {
  const { ticker } = await params;
  const sp = searchParams ? await searchParams : {};
  const raw = decodeURIComponent(ticker).toLowerCase();

  if (RESERVED.has(raw)) notFound();

  const token = await resolveToken(raw, sp.mint);
  if (!token) notFound();

  permanentRedirect(tokenSharePath(token));
}
