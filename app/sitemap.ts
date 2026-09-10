import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-config';
import { SEO_LANDING_SLUGS } from '@/lib/seo-landings';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, '');

  const core: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
  ];

  const landings: MetadataRoute.Sitemap = SEO_LANDING_SLUGS.map((slug) => ({
    url: `${base}/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: slug === 'tseny' || slug === 'kontakty' ? 0.85 : 0.9,
  }));

  return [...core, ...landings];
}
