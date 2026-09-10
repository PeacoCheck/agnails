import type { SiteContent } from '@/lib/site-content-schema';
import { getSiteUrl } from '@/lib/site-config';

/** Approx. studio coordinates — ул. Санфировой, 95/2, Самара */
const STUDIO_GEO = {
  latitude: 53.22175,
  longitude: 50.19196,
} as const;

export default function LocalBusinessJsonLd({ content }: { content: SiteContent }) {
  const siteUrl = getSiteUrl();
  const sameAs = [content.links.vk, content.links.telegram, content.links.max, content.links.whatsapp].filter(Boolean);

  const data = {
    '@context': 'https://schema.org',
    '@type': 'NailSalon',
    name: content.business.name,
    image: new URL('/og.png', siteUrl).toString(),
    url: siteUrl,
    telephone: content.business.phoneE164,
    priceRange: content.business.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: content.business.address.streetAddress,
      addressLocality: content.business.address.locality,
      addressRegion: 'Самарская область',
      addressCountry: content.business.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: STUDIO_GEO.latitude,
      longitude: STUDIO_GEO.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: content.business.workingHours.opens,
        closes: content.business.workingHours.closes,
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(content.business.rating.value),
      reviewCount: String(content.business.rating.reviewCount),
      ratingCount: String(content.business.rating.ratingCount),
    },
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
