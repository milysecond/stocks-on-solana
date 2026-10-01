import { MetadataRoute } from 'next';
import { fetchScreenerBundle } from '@/lib/discover-tokens';
import { ALL_TOKENS } from '@/lib/tokens';
import { tokenShareUrl } from '@/lib/resolve-token';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE = 'https://stocksonsolana.com';
const TOP_N = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let tokens = ALL_TOKENS;
  let prices: Record<string, { volume24h: number | null }> = {};
  try {
    const bundle = await fetchScreenerBundle();
    if (bundle.tokens.length) tokens = bundle.tokens;
    prices = bundle.prices;
  } catch {
    tokens = ALL_TOKENS;
  }

  const ranked = [...tokens].sort((a, b) => {
    const va = prices[a.mint]?.volume24h ?? 0;
    const vb = prices[b.mint]?.volume24h ?? 0;
    return vb - va;
  });

  const seen = new Set<string>();
  const tokenPages: MetadataRoute.Sitemap = [];
  for (const t of ranked) {
    const slug = t.symbol.toLowerCase();
    if (seen.has(slug)) continue;
    seen.add(slug);
    tokenPages.push({
      url: tokenShareUrl(t),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: tokenPages.length < 30 ? 0.9 : 0.7,
    });
    if (tokenPages.length >= TOP_N) break;
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/exchanges`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/partners`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/brand`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ];

  return [...staticPages, ...tokenPages];
}
