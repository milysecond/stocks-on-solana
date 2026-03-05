import { MetadataRoute } from 'next';
import { discoverTokens } from '@/lib/discover-tokens';
import { ALL_TOKENS } from '@/lib/tokens';

const BASE = 'https://stocksonsolana.com';

export const revalidate = 3600; // regenerate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch dynamic token list; fall back to static if unavailable
  let tokens;
  try {
    tokens = await discoverTokens();
  } catch {
    tokens = ALL_TOKENS;
  }

  const tokenPages: MetadataRoute.Sitemap = tokens.map(t => ({
    url: `${BASE}/token/${t.symbol.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    ...tokenPages,
  ];
}
