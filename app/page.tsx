import WorksMarquee from '@/components/WorksMarquee';
import TrackedLink from '@/components/TrackedLink';
import PromoWidget from '@/components/PromoWidget';
import BookingNudge from '@/components/BookingNudge';
import ReviewsMarquee from '@/components/ReviewsMarquee';
import { getSiteContent } from '@/lib/site-content';
import { DIKIDI_WIDGET_HREF } from '@/lib/dikidi-widget';
import Link from 'next/link';

export const revalidate = 60;

export default async function Home() {
  const content = await getSiteContent();
  const manicurePrice = content.priceGroups.find((group) => group.title === 'Маникюр')?.items.find((item) => item.name === 'Коррекция')?.price;

  const socials = [
    { label: 'Instagram', href: content.links.whatsapp, icon: '/icons/instagram.svg', goal: 'contact_whatsapp' as const },
    { label: 'VK', href: content.links.vk, icon: '/icons/vk.svg', goal: 'social_vk' as const },
    { label: 'Telegram', href: content.links.telegram, icon: '/icons/telegram.svg', goal: 'social_telegram' as const },
    { label: 'MAX', href: content.links.max, icon: '/icons/max.svg', goal: 'social_max' as const },
  ];

  return (
    <main id="top">
      <header className="topbar">
        <a className="logo" href="#top">{content.business.name}</a>
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
          <a href="#works">Работы</a>
          <a href="#prices">Цены</a>
          <a href="#reviews">Отзывы</a>
          <a href="#location">Адрес</a>
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

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-landmark">ТЦ «Охотный ряд»</span>
          <span className="overline">{content.hero.eyebrow}</span>
          <h1>
            {content.hero.titleLine1}<br />
            <span>{content.hero.titleLine2}</span>
          </h1>
          {manicurePrice ? <p className="hero-offer"><strong>Маникюр с покрытием — от {manicurePrice}</strong><br />Снятие, маникюр и новое покрытие входят. В DIKIDI выбирайте «Коррекция» — подходит и для первого визита.</p> : null}
          <div className="hero-actions">
            <TrackedLink
              goal="booking_dikidi"
              className="primary"
              href={DIKIDI_WIDGET_HREF}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/icons/dikidi.png" alt="" />
              Записаться в DIKIDI <span>↗</span>
            </TrackedLink>
            <a className="hero-link hero-link-rating" href="#reviews">
              <img src="/icons/reviews.svg" alt="" />
              <span className="hero-link-copy">
                <b>Рейтинг DIKIDI {content.business.rating.value}</b>
                <small>
                  {content.business.rating.ratingCount >= 200
                    ? '200+ оценок'
                    : `${content.business.rating.ratingCount} оценок`}
                </small>
              </span>
            </a>
            <TrackedLink
              goal="route_yandex_maps"
              className="hero-link"
              href={content.links.yandexMaps}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/icons/map-marker.svg" alt="" />
              На Яндекс Картах
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
          <div className="master-chip">
            <img
              src="/images/anastasia.png"
              alt={content.business.masterName}
              loading="eager"
              decoding="async"
            />
            <span>
              <b>{content.business.masterName}</b>
              мастер маникюра
            </span>
          </div>
        </div>
      </section>

      <ReviewsMarquee
        reviews={content.reviews}
        ratingValue={content.business.rating.value}
      />

      <section className="work-showcase" id="works">
        <div className="section-head dark-head">
          <span>Работы</span>
          <h2>{content.copy.worksTitle}</h2>
          <p>{content.copy.worksDescription}</p>
        </div>
        <WorksMarquee works={content.works} />
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
                    <span>{group.title === 'Маникюр' && item.name === 'Коррекция' ? 'Маникюр с покрытием / коррекция' : item.name}</span>
                    <i className="price-leader" aria-hidden="true" />
                    <b>{item.price}</b>
                  </p>
                ))}
              </div>
              <nav className="price-details" aria-label={`Подробнее: ${group.title}`}>
                {group.title === 'Маникюр' ? <>
                  <Link href="/manikyur-samara">О маникюре <span aria-hidden="true">→</span></Link>
                  <Link href="/narashchivanie-nogtey-samara">Наращивание <span aria-hidden="true">→</span></Link>
                </> : null}
                {group.title === 'Педикюр' ? <Link href="/pedikyur-samara">О педикюре <span aria-hidden="true">→</span></Link> : null}
                {group.title === 'Дополнительно' ? <>
                  <Link href="/dizayn-nogtey-samara">Дизайн ногтей <span aria-hidden="true">→</span></Link>
                </> : null}
              </nav>
            </article>
          ))}
        </div>
        <div className="price-foot">
          <div><p>{content.copy.priceNote}</p><Link className="context-link" href="/tseny">Полный прайс и длительность услуг <span aria-hidden="true">→</span></Link></div>
          <TrackedLink
            goal="booking_dikidi"
            className="primary"
            href={DIKIDI_WIDGET_HREF}
            target="_blank"
            rel="noreferrer"
          >
            Выбрать услугу <span>↗</span>
          </TrackedLink>
        </div>
      </section>

      <section className="work-showcase reviews-showcase" id="reviews">
        <div className="section-head dark-head">
          <span>Отзывы</span>
          <h2>Рейтинг DIKIDI {content.business.rating.value}</h2>
          <p>
            {content.business.rating.ratingCount >= 200
              ? '200+ оценок'
              : `${content.business.rating.ratingCount} оценок`}
            {' · '}
            {content.business.rating.reviewCount} отзывов
          </p>
        </div>
        <ReviewsMarquee
          reviews={content.reviews}
          ratingValue={content.business.rating.value}
          className="in-section"
        />
        <TrackedLink
          goal="reviews_dikidi"
          className="quiet-link light"
          href={`${content.links.dikidi}/reviews/`}
          target="_blank"
          rel="noreferrer"
        >
          <img src="/icons/dikidi.png" alt="" />
          Все отзывы в DIKIDI <span>↗</span>
        </TrackedLink>
      </section>

      <section className="location shell" id="location">
        <div className="section-head">
          <span>Студия</span>
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
            <Link className="context-link" href="/kontakty">Как найти студию <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="booking shell" id="booking">
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
            <span className="booking-hours">{content.business.workingHours.label}</span>
          </div>
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
        href={DIKIDI_WIDGET_HREF}
        target="_blank"
        rel="noreferrer"
      >
        Записаться <span>↗</span>
      </TrackedLink>

      <PromoWidget defaultDikidiUrl={DIKIDI_WIDGET_HREF} />
      <BookingNudge
        dikidiUrl={DIKIDI_WIDGET_HREF}
        city={content.business.city}
        ratingValue={content.business.rating.value}
        ratingCount={content.business.rating.ratingCount}
      />
    </main>
  );
}
