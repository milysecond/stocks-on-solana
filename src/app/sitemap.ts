import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://stocksonsolana.com', lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: 'https://stocksonsolana.com/dashboard', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];
}
