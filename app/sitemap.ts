import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
