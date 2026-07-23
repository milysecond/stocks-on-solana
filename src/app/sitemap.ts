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

  // Dedupe by lowercased symbol so sitemap stays clean
  const seen = new Set<string>();
  const tokenPages: MetadataRoute.Sitemap = [];
  for (const t of tokens) {
    const slug = t.symbol.toLowerCase();
    if (seen.has(slug)) continue;
    seen.add(slug);
    tokenPages.push({
      url: `${BASE}/token/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    });
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE}/partners`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ];

  return [...staticPages, ...tokenPages];
}
