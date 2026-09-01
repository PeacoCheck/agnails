import type { Metadata } from 'next';
import './globals.css';
import YandexMetrika from '@/components/YandexMetrika';
import LocalBusinessJsonLd from '@/components/LocalBusinessJsonLd';
import { getSiteUrl } from '@/lib/site-config';
import { getSiteContent } from '@/lib/site-content';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const content = await getSiteContent();

  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
    },
    title: `${content.business.name} — маникюр и педикюр в Самаре`,
    description: `${content.hero.description} Онлайн-запись через DIKIDI. Самара, ${content.business.address.streetAddress}.`,
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
    openGraph: {
      type: 'website',
      url: siteUrl,
      title: `${content.business.name} — маникюр и педикюр в Самаре`,
      description: `${content.hero.description} Запись онлайн через DIKIDI.`,
      images: [{ url: '/og.png', width: 1731, height: 909, alt: `${content.business.name} — Самара` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${content.business.name} — маникюр и педикюр в Самаре`,
      description: `${content.hero.description} Запись онлайн через DIKIDI.`,
      images: ['/og.png'],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();

  return (
    <html lang="ru">
      <head>
        <link rel="preload" href="/images/work-white.png" as="image" />
        <link rel="preload" href="/images/anastasia.png" as="image" />
      </head>
      <body>
        <LocalBusinessJsonLd content={content} />
        <YandexMetrika />
        {children}
      </body>
    </html>
  );
}

