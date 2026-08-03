import { ALL_TOKENS, type StockToken } from '@/lib/tokens';
import { discoverTokens } from '@/lib/discover-tokens';

/** Normalize symbol slug for matching */
export function normalizeSymbolSlug(raw: string): string {
  return decodeURIComponent(raw).trim().toLowerCase();
}

/** Strip issuer suffixes (x / on / pre) without eating letters inside the ticker */
export function baseSymbol(symbol: string): string {
  return symbol
    .toLowerCase()
    .replace(/pre$/i, '')
    .replace(/on$/i, '')
    .replace(/x$/i, '');
}

function byMint(list: StockToken[], mint: string): StockToken | undefined {
  const m = mint.trim();
  if (!m) return undefined;
  return list.find(t => t.mint === m || t.mint.toLowerCase() === m.toLowerCase());
}

function bySlug(list: StockToken[], slug: string): StockToken | undefined {
  // 1) exact symbol
  const exact = list.find(t => t.symbol.toLowerCase() === slug);
  if (exact) return exact;

  // 2) company key (e.g. INTC)
  const byCompany = list.find(t => (t.company || '').toLowerCase() === slug);
  if (byCompany) return byCompany;

  // 3) base symbol (INTCx / INTCon → intc)
  const byBase = list.find(t => baseSymbol(t.symbol) === slug);
  if (byBase) return byBase;

  // 4) name slug
  return list.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === slug);
}

/**
 * Resolve a token from a URL ticker slug and optional mint query.
 * Prefer exact + mint so Sunrise INTC ≠ xStocks INTCx when mint is known.
 */
export async function resolveToken(
  ticker: string,
  mintHint?: string | null
): Promise<StockToken | undefined> {
  const slug = normalizeSymbolSlug(ticker);

  // Mint-only path: /token/<mint>
  if (slug.length >= 32 && !slug.includes('.')) {
    const staticMint = byMint(ALL_TOKENS, slug);
    if (staticMint) return staticMint;
  }

  if (mintHint) {
    const staticMint = byMint(ALL_TOKENS, mintHint);
    if (staticMint) return staticMint;
  }

  // Prefer exact symbol on static list before fuzzy base match
  const staticExact = ALL_TOKENS.find(t => t.symbol.toLowerCase() === slug);
  if (staticExact && !mintHint) return staticExact;

  try {
    const discovered = await discoverTokens();
    const pool = discovered.length ? discovered : ALL_TOKENS;

    if (mintHint) {
      const m = byMint(pool, mintHint);
      if (m) return m;
    }
    if (slug.length >= 32) {
      const m = byMint(pool, slug);
      if (m) return m;
    }

    // Exact first on live universe (Sunrise bare INTC wins over INTCx strip)
    const exact = pool.find(t => t.symbol.toLowerCase() === slug);
    if (exact) return exact;

    return bySlug(pool, slug) || bySlug(ALL_TOKENS, slug);
  } catch {
    // Offline / datapi fail — fuzzy static fallback
    if (mintHint) {
      const m = byMint(ALL_TOKENS, mintHint);
      if (m) return m;
    }
    return bySlug(ALL_TOKENS, slug);
  }
}

/** Canonical path for tweets + share (includes mint when disambiguating) */
export function tokenSharePath(token: { symbol: string; mint: string }, opts?: { withMint?: boolean }): string {
  const sym = encodeURIComponent(token.symbol.toLowerCase());
  const base = `/token/${sym}`;
  if (opts?.withMint !== false) {
    // Always attach mint so bare INTC / INTCx never collide
    return `${base}?mint=${encodeURIComponent(token.mint)}`;
  }
  return base;
}

export function tokenShareUrl(token: { symbol: string; mint: string }): string {
  return `https://stocksonsolana.com${tokenSharePath(token)}`;
}
