import { MetadataRoute } from 'next';
import { ALL_TOKENS } from '@/lib/tokens';

const BASE = 'https://stocks.sol.new';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const tokenPages: MetadataRoute.Sitemap = ALL_TOKENS.map(t => ({
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
