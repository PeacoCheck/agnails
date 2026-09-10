import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import YandexMetrika from '@/components/YandexMetrika';
import LocalBusinessJsonLd from '@/components/LocalBusinessJsonLd';
import { getSiteUrl } from '@/lib/site-config';
import { getSiteContent } from '@/lib/site-content';
import HashScroll from '@/components/HashScroll';
import VisitBeacon from '@/components/VisitBeacon';
import DikidiWidgetScript from '@/components/DikidiWidgetScript';

const display = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const content = await getSiteContent();
  const description = `Маникюр, педикюр и наращивание ногтей в Самаре — ${content.business.name}. ${content.business.address.streetAddress}. Цены, фото работ и онлайн-запись в DIKIDI.`;

  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
    },
    title: `${content.business.name} — маникюр и педикюр в Самаре`,
    description,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
        { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
    },
    openGraph: {
      type: 'website',
      url: siteUrl,
      title: `${content.business.name} — маникюр и педикюр в Самаре`,
      description,
      images: [{ url: '/og.png', width: 1731, height: 909, alt: `${content.business.name} — Самара` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${content.business.name} — маникюр и педикюр в Самаре`,
      description,
      images: ['/og.png'],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();

  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="preload" href="/images/work-white.png" as="image" />
        <link rel="preload" href="/images/anastasia.png" as="image" />
        <YandexMetrika />
      </head>
      <body>
        <HashScroll />
        <VisitBeacon />
        <DikidiWidgetScript />
        <LocalBusinessJsonLd content={content} />
        {children}
      </body>
    </html>
  );
}
