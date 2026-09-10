import Link from 'next/link';
import TrackedLink from '@/components/TrackedLink';
import { getSiteContent } from '@/lib/site-content';
import type { SeoLanding } from '@/lib/seo-landings';
import ServiceNavigation from '@/components/ServiceNavigation';
import { getSiteUrl } from '@/lib/site-config';
import { DIKIDI_WIDGET_HREF } from '@/lib/dikidi-widget';

export default async function SeoLandingPage({ landing }: { landing: SeoLanding }) {
  const content = await getSiteContent();
  const selectedWorks = landing.workImageIds
    .map((id) => content.works.find((work) => work.id === id || work.src === id))
    .filter((work): work is (typeof content.works)[number] => Boolean(work));
  const works = selectedWorks.length ? selectedWorks : content.works
    .filter((work) => landing.slug === 'pedikyur-samara'
      ? /педикюр/i.test(`${work.title} ${work.alt}`)
      : !/педикюр/i.test(`${work.title} ${work.alt}`))
    .slice(0, 4);
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: content.business.name, item: getSiteUrl() },
      { '@type': 'ListItem', position: 2, name: landing.h1, item: new URL(landing.slug, getSiteUrl()).href },
    ],
  };

  const faqJsonLd =
    landing.includeFaqJsonLd && landing.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: landing.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        }
      : null;

  return (
    <main className="seo-page" id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
        />
      ) : null}

      <header className="topbar">
        <Link className="logo" href="/">
          {content.business.name}
        </Link>
        <div className="topbar-info">
          <span className="topbar-hours">{content.business.workingHours.label}</span>
          <TrackedLink
            goal="contact_phone"
            href={`tel:${content.business.phoneE164}`}
            className="topbar-phone"
          >
            <img src="/icons/phone.svg" alt="" />
            <span>{content.business.phoneDisplay}</span>
          </TrackedLink>
        </div>
        <nav aria-label="Навигация">
          <Link href="/#works">Работы</Link>
          <Link href="/tseny">Цены</Link>
          <Link href="/#reviews">Отзывы</Link>
          <Link href="/kontakty">Контакты</Link>
        </nav>
        <TrackedLink
          goal="booking_dikidi"
          className="nav-book"
          href={DIKIDI_WIDGET_HREF}
          target="_blank"
          rel="noreferrer"
        >
          Записаться
        </TrackedLink>
      </header>

      <section className="seo-hero shell">
        <ServiceNavigation current={landing.slug} />
        <nav className="seo-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link><span aria-hidden="true">/</span><span aria-current="page">{landing.h1}</span>
        </nav>
        <div className="section-head">
          <span>{content.business.name} · {content.business.city}</span>
          <h1>{landing.h1}</h1>
          {landing.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <div className="seo-hero-actions">
          <TrackedLink
            goal="booking_dikidi"
            className="primary"
            href={DIKIDI_WIDGET_HREF}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/icons/dikidi.png" alt="" />
            {landing.ctaLabel} <span>↗</span>
          </TrackedLink>
          <TrackedLink
            goal="contact_phone"
            className="hero-link"
            href={`tel:${content.business.phoneE164}`}
          >
            <img src="/icons/phone.svg" alt="" />
            {content.business.phoneDisplay}
          </TrackedLink>
        </div>
      </section>

      <section className="prices shell seo-prices">
        <div className="section-head">
          <span>Прайс</span>
          <h2>Стоимость и длительность</h2>
          <p>Только актуальные позиции студии. Дизайн и допы — по желанию.</p>
        </div>
        <div className="price-board seo-price-board">
          <article>
            <h3>Услуги</h3>
            <div>
              {landing.priceRows.map((row) => (
                <p key={row.name}>
                  <span>
                    {row.name}
                    <em className="seo-duration">{row.duration}</em>
                  </span>
                  <i className="price-leader" aria-hidden="true" />
                  <b>{row.price}</b>
                </p>
              ))}
            </div>
          </article>
        </div>
        <div className="price-foot">
          <p>{content.copy.priceNote}</p>
          <TrackedLink
            goal="booking_dikidi"
            className="primary"
            href={DIKIDI_WIDGET_HREF}
            target="_blank"
            rel="noreferrer"
          >
            {landing.ctaLabel} <span>↗</span>
          </TrackedLink>
        </div>
      </section>

      {works.length > 0 ? (
        <section className="work-showcase seo-works">
          <div className="section-head dark-head">
            <span>Работы</span>
            <h2>Примеры из студии</h2>
            <p>Реальные фото мастера Анастасии.</p>
          </div>
          <div className="seo-gallery shell">
            {works.map((work) => (
              <figure key={work.id || work.src} className="seo-work-card">
                <img src={work.src} alt={work.alt} loading="lazy" decoding="async" />
                <figcaption>{work.title}</figcaption>
              </figure>
            ))}
          </div>
          <TrackedLink
            goal="social_vk"
            className="quiet-link light"
            href={content.links.vk}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/icons/vk.svg" alt="" />
            Больше работ ВКонтакте <span>↗</span>
          </TrackedLink>
        </section>
      ) : null}

      <section className="location shell seo-location">
        <div className="section-head">
          <span>Студия</span>
          <h2>
            {content.business.city}, {content.business.address.shortAddress}
          </h2>
          <p>
            {content.business.address.details}. {content.business.address.landmark}.
          </p>
        </div>
        <div className="address-panel seo-address">
          <span>Адрес и контакты</span>
          <h3>{content.business.address.streetAddress}</h3>
          <p>
            {content.business.city}
            <br />
            <b>Телефон:</b>{' '}
            <TrackedLink goal="contact_phone" href={`tel:${content.business.phoneE164}`}>
              {content.business.phoneDisplay}
            </TrackedLink>
            <br />
            <b>Часы работы:</b> {content.business.workingHours.label}
          </p>
          <div className="seo-address-actions">
            <TrackedLink
              goal="route_yandex_maps"
              className="primary"
              href={content.links.yandexMaps}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/icons/map-marker.svg" alt="" />
              Открыть карты <span>↗</span>
            </TrackedLink>
            <TrackedLink
              goal="booking_dikidi"
              className="primary white"
              href={DIKIDI_WIDGET_HREF}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/icons/dikidi.png" alt="" />
              DIKIDI <span>↗</span>
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="shell seo-faq">
        <div className="section-head">
          <span>FAQ</span>
          <h2>Частые вопросы</h2>
        </div>
        <div className="seo-faq-list">
          {landing.faq.map((item) => (
            <details key={item.q} className="seo-faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="booking shell seo-cta">
        <div>
          <span>Запись</span>
          <h2>{landing.ctaLabel}</h2>
          <p>
            Выберите услугу и время в DIKIDI — или позвоните{' '}
            <TrackedLink goal="contact_phone" href={`tel:${content.business.phoneE164}`}>
              {content.business.phoneDisplay}
            </TrackedLink>
            .
          </p>
        </div>
        <div className="booking-actions">
          <TrackedLink
            goal="booking_dikidi"
            className="primary white"
            href={DIKIDI_WIDGET_HREF}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/icons/dikidi.png" alt="" />
            Открыть DIKIDI <span>↗</span>
          </TrackedLink>
        </div>
      </section>

      <footer className="site-footer">
        <Link className="logo" href="/">
          {content.business.name}
        </Link>
        <p>{content.copy.footerText}</p>
        <div className="site-footer-socials" aria-label="Соцсети">
          <TrackedLink
            goal="contact_whatsapp"
            href={content.links.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <img src="/icons/instagram.svg" alt="" />
          </TrackedLink>
          <TrackedLink
            goal="social_vk"
            href={content.links.vk}
            target="_blank"
            rel="noreferrer"
            aria-label="VK"
          >
            <img src="/icons/vk.svg" alt="" />
          </TrackedLink>
          <TrackedLink
            goal="social_telegram"
            href={content.links.telegram}
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
          >
            <img src="/icons/telegram.svg" alt="" />
          </TrackedLink>
          <TrackedLink
            goal="social_max"
            href={content.links.max}
            target="_blank"
            rel="noreferrer"
            aria-label="MAX"
          >
            <img src="/icons/max.svg" alt="" />
          </TrackedLink>
        </div>
        <Link className="footer-home-link" href="/">
          На главную
        </Link>
      </footer>

      <TrackedLink
        goal="booking_dikidi"
        className="mobile-book"
        href={DIKIDI_WIDGET_HREF}
        target="_blank"
        rel="noreferrer"
      >
        {landing.ctaLabel} <span>↗</span>
      </TrackedLink>
    </main>
  );
}
