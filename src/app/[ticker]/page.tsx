import { permanentRedirect, notFound } from 'next/navigation';
import { ALL_TOKENS } from '@/lib/tokens';
import { discoverTokens } from '@/lib/discover-tokens';

export const runtime = 'edge';

interface Props {
  params: Promise<{ ticker: string }>;
}

// Reserved app routes — don't treat as tickers
const RESERVED = new Set([
  'privacy',
  'terms',
  'partners',
  'api',
  'dashboard',
  'token',
  'sitemap.xml',
  'robots.txt',
  'flash',
  'opengraph-image',
  'favicon.ico',
]);

/**
 * Short /TICKER URLs permanently redirect to /token/TICKER so GSC sees a
 * single canonical path (sitemap + metadata already use /token/...).
 */
export default async function TickerRedirectPage({ params }: Props) {
  const { ticker } = await params;
  const raw = decodeURIComponent(ticker).toLowerCase();

  if (RESERVED.has(raw)) notFound();

  const match = (list: typeof ALL_TOKENS) =>
    list.find(
      t =>
        t.symbol.toLowerCase() === raw ||
        t.symbol.toLowerCase().replace(/[xon]+$/, '') === raw
    );

  let token = match(ALL_TOKENS);
  if (!token) {
    try {
      const discovered = await discoverTokens();
      token = match(discovered);
    } catch {
      // fall through
    }
  }

  if (!token) notFound();

  permanentRedirect(`/token/${encodeURIComponent(token.symbol.toLowerCase())}`);
}
