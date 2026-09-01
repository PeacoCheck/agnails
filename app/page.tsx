import WorkGallery from './WorkGallery';
import TrackedLink from '@/components/TrackedLink';
import PromoWidget from '@/components/PromoWidget';
import { getSiteContent } from '@/lib/site-content';


export const revalidate = 60;

export default async function Home() {
  const content = await getSiteContent();

  const socials = [
    { label: 'WhatsApp', href: content.links.whatsapp, icon: '/icons/whatsapp.svg', goal: 'contact_whatsapp' as const },
    { label: 'VK', href: content.links.vk, icon: '/icons/vk.svg', goal: 'social_vk' as const },
    { label: 'Telegram', href: content.links.telegram, icon: '/icons/telegram.svg', goal: 'social_telegram' as const },
    { label: 'MAX', href: content.links.max, icon: '/icons/max.svg', goal: 'social_max' as const },
  ];

  return (
    <main id="top">
      <header className="topbar">
        <a className="logo" href="#top">{content.business.name}</a>
        <div className="topbar-info">
          <span className="topbar-hours">🕒 {content.business.workingHours.label}</span>
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
          <a href="#works">Работы</a>
          <a href="#prices">Цены</a>
          <a href="#reviews">Отзывы</a>
          <a href="#location">Адрес</a>
        </nav>
        <TrackedLink
          goal="booking_dikidi"
          className="nav-book"
          href={content.links.dikidi}
          target="_blank"
          rel="noreferrer"
        >
          Записаться
        </TrackedLink>
      </header>

      <section className="hero">
        <div className="doodle-orbit" aria-hidden="true" />
        <div className="hero-copy">
          <span className="overline">{content.hero.eyebrow}</span>
          <h1>
            {content.hero.titleLine1}<br />
            <span>{content.hero.titleLine2}</span>
          </h1>
          <p>{content.hero.description}</p>
          <div className="hero-actions">
            <TrackedLink
              goal="booking_dikidi"
              className="primary"
              href={content.links.dikidi}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/icons/dikidi.ico" alt="" />
              Записаться в DIKIDI <span>↗</span>
            </TrackedLink>
            <a className="hero-link" href="#reviews">
              <img src="/icons/reviews.svg" alt="" />
              Отзывы
            </a>
            <TrackedLink
              goal="route_yandex_maps"
              className="hero-link"
              href={content.links.yandexMaps}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/icons/map-marker.svg" alt="" />
              Я на картах
            </TrackedLink>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="/images/work-white.png"
            alt="Молочный маникюр — работа мастера Анастасии"
            loading="eager"
            decoding="async"
          />
          <span className="sketch-lines" aria-hidden="true"><i /><i /><i /></span>
          <div className="master-chip">
            <img
              src="/images/anastasia.png"
              alt={content.business.masterName}
              loading="eager"
              decoding="async"
            />
            <span>
              <b>{content.business.masterName}</b>
              nail-мастер
            </span>
          </div>
        </div>
      </section>

      <section className="work-showcase" id="works">
        <div className="section-head dark-head">
          <span>Работы</span>
          <h2>{content.copy.worksTitle}</h2>
          <p>{content.copy.worksDescription}</p>
        </div>
        <WorkGallery works={content.works} />
        <TrackedLink
          goal="social_vk"
          className="quiet-link light"
          href={content.links.vk}
          target="_blank"
          rel="noreferrer"
        >
          Больше работ во VK ↗
        </TrackedLink>
      </section>

      <section className="prices shell" id="prices">


        <div className="section-head">
          <span>Цены</span>
          <h2>{content.copy.pricesTitle}</h2>
          <p>{content.copy.pricesDescription}</p>
        </div>
        <div className="price-board">
          {content.priceGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <div>
                {group.items.map((item) => (
                  <p key={item.name}>
                    <span>{item.name}</span>
                    <b>{item.price}</b>
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="price-foot">
          <p>{content.copy.priceNote}</p>
          <TrackedLink
            goal="booking_dikidi"
            className="primary"
            href={content.links.dikidi}
            target="_blank"
            rel="noreferrer"
          >
            Выбрать услугу <span>↗</span>
          </TrackedLink>
        </div>
      </section>

      <section className="reviews shell" id="reviews">
        <div className="rating-panel">
          <span>Отзывы из DIKIDI</span>
          <strong>{content.business.rating.value}</strong>
          <p>{content.business.rating.ratingCount} оценок · {content.business.rating.reviewCount} отзывов</p>
          <TrackedLink
            goal="booking_dikidi"
            href={`${content.links.dikidi}/reviews/`}
            target="_blank"
            rel="noreferrer"
          >
            Смотреть все ↗
          </TrackedLink>
        </div>
        <div className="review-list">
          {content.reviews.map((review) => (
            <article key={`${review.name}-${review.service}-${review.date}`}>
              <div className="stars">{'★'.repeat(review.rating || 5)}</div>
              <p>“{review.text}”</p>
              <footer>
                <b>{review.name}</b>
                <span>{review.service} · {review.date}</span>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="location shell" id="location">
        <div className="section-head">
          <h2>{content.copy.locationTitle}</h2>
          <p>{content.copy.locationDescription}</p>
        </div>
        <div className="map-card">
          <iframe
            title="Карта проезда к AG Nails"
            src={content.links.yandexMapWidget}
            loading="lazy"
          />
          <div className="address-panel">
            <span>Адрес студии</span>
            <h3>{content.business.address.shortAddress}</h3>
            <p>
              {content.business.address.details}<br />
              {content.business.address.landmark}<br />
              <b>Часы работы:</b> {content.business.workingHours.label}
            </p>
            <TrackedLink
              goal="route_yandex_maps"
              className="primary white"
              href={content.links.yandexMaps}
              target="_blank"
              rel="noreferrer"
            >
              Маршрут <span>↗</span>
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="booking shell">
        <div>
          <span>Онлайн-запись и контакты</span>
          <h2>{content.copy.bookingTitle}</h2>
          <p>{content.copy.bookingDescription}</p>
          <div className="booking-contact-direct">
            <TrackedLink
              goal="contact_phone"
              href={`tel:${content.business.phoneE164}`}
              className="booking-phone-link"
            >
              <img src="/icons/phone.svg" alt="" />
              <span>{content.business.phoneDisplay}</span>
            </TrackedLink>
            <span className="booking-hours">🕒 {content.business.workingHours.label}</span>
          </div>
        </div>
        <div className="booking-actions">
          <TrackedLink
            goal="booking_dikidi"
            className="primary white"
            href={content.links.dikidi}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/icons/dikidi.ico" alt="" />
            Открыть DIKIDI <span>↗</span>
          </TrackedLink>
          <div className="booking-socials" aria-label="Социальные сети и мессенджеры">
            {socials.map((social) => (
              <TrackedLink
                key={social.label}
                goal={social.goal}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
              >
                <img src={social.icon} alt="" />
                <span>{social.label}</span>
              </TrackedLink>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="logo" href="#top">{content.business.name}</a>
        <p>{content.copy.footerText}</p>
        <div>
          {socials.map((social) => (
            <TrackedLink
              key={social.label}
              goal={social.goal}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
            >
              <img src={social.icon} alt="" />
            </TrackedLink>
          ))}
        </div>
      </footer>

      <TrackedLink
        goal="booking_dikidi"
        className="mobile-book"
        href={content.links.dikidi}
        target="_blank"
        rel="noreferrer"
      >
        Записаться в DIKIDI <span>↗</span>
      </TrackedLink>

      <PromoWidget defaultDikidiUrl={content.links.dikidi} />
    </main>
  );
}


