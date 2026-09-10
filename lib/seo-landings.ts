import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-config';

export type SeoPriceRow = {
  name: string;
  price: string;
  duration: string;
};

export type SeoFaqItem = {
  q: string;
  a: string;
};

export type SeoLandingSlug =
  | 'manikyur-samara'
  | 'pedikyur-samara'
  | 'narashchivanie-nogtey-samara'
  | 'dizayn-nogtey-samara'
  | 'tseny'
  | 'kontakty';

export type SeoLanding = {
  slug: SeoLandingSlug;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  priceRows: SeoPriceRow[];
  faq: SeoFaqItem[];
  workImageIds: string[];
  ctaLabel: string;
  includeFaqJsonLd?: boolean;
};

export const SEO_LANDINGS: Record<SeoLandingSlug, SeoLanding> = {
  'manikyur-samara': {
    slug: 'manikyur-samara',
    title: 'Маникюр в Самаре — AG Nails',
    description:
      'Маникюр в Самаре: без покрытия 1500 ₽, коррекция 2000 ₽, наращивание 2500 ₽. Санфировой 95/2, офис 616. Запись в DIKIDI.',
    h1: 'Маникюр в Самаре',
    intro: [
      'Маникюр, коррекция и наращивание у мастера Анастасии. Студия AG Nails — Самара, ул. Санфировой, 95/2, офис 616.',
      'В прайсе — актуальные цены и время. Запись онлайн в DIKIDI или по телефону +7 977 053-11-89.',
    ],
    priceRows: [
      { name: 'Наращивание ногтей', price: '2500 ₽', duration: '2,5–3 ч' },
      { name: 'Коррекция', price: '2000 ₽', duration: '~2 ч' },
      { name: 'Маникюр без покрытия', price: '1500 ₽', duration: '~1 ч' },
      { name: 'Френч / втирка', price: '200 ₽', duration: '+15–20 мин' },
      { name: 'Дизайны', price: '50–400 ₽', duration: '+15–40 мин' },
      { name: 'Снятие без покрытия', price: '400 ₽', duration: '~20 мин' },
    ],
    faq: [
      {
        q: 'Сколько длится маникюр?',
        a: 'Без покрытия — около часа. Коррекция — около 2 часов. Наращивание — 2,5–3 часа.',
      },
      {
        q: 'Как записаться?',
        a: 'Через DIKIDI или по телефону +7 977 053-11-89.',
      },
      {
        q: 'Где студия?',
        a: 'Самара, ул. Санфировой, 95/2, офис 616 (5 этаж), ТЦ «Охотный ряд». Ежедневно 8:00–23:00, по записи.',
      },
    ],
    workImageIds: ['work-white', 'work-lines', 'work-lines-close', 'palette-caramel'],
    ctaLabel: 'Записаться на маникюр',
    includeFaqJsonLd: true,
  },

  'pedikyur-samara': {
    slug: 'pedikyur-samara',
    title: 'Педикюр в Самаре — AG Nails',
    description:
      'Педикюр в Самаре: полный 2000 ₽, экспресс 1700 ₽, без покрытия 1500 ₽. Санфировой 95/2. Запись в DIKIDI.',
    h1: 'Педикюр в Самаре',
    intro: [
      'Полный педикюр, экспресс и педикюр без покрытия. AG Nails, Самара, Санфировой 95/2, офис 616.',
      'По желанию — SPA, френч или дизайн. Запись в DIKIDI или по телефону.',
    ],
    priceRows: [
      { name: 'Педикюр — полный комплекс', price: '2000 ₽', duration: '~1,5 ч' },
      { name: 'Экспресс-педикюр', price: '1700 ₽', duration: '~1 ч' },
      { name: 'Педикюр без покрытия', price: '1500 ₽', duration: '~1 ч' },
      { name: 'SPA-уход', price: '400 ₽', duration: '+15–20 мин' },
      { name: 'Френч / втирка', price: '200 ₽', duration: '+15–20 мин' },
      { name: 'Дизайны', price: '50–400 ₽', duration: '+15–40 мин' },
    ],
    faq: [
      {
        q: 'Чем полный педикюр отличается от экспресса?',
        a: 'Полный — около 1,5 часов, более тщательная обработка. Экспресс — около часа, для поддержки между визитами.',
      },
      {
        q: 'Можно без покрытия?',
        a: 'Да, 1500 ₽. Покрытие, SPA и дизайн — отдельно по прайсу.',
      },
      {
        q: 'Как записаться?',
        a: 'В DIKIDI или по телефону +7 977 053-11-89. Ежедневно 8:00–23:00.',
      },
    ],
    workImageIds: ['palette-wine', 'palette-bright', 'work-white', 'palette-glitter'],
    ctaLabel: 'Записаться на педикюр',
    includeFaqJsonLd: true,
  },

  'narashchivanie-nogtey-samara': {
    slug: 'narashchivanie-nogtey-samara',
    title: 'Наращивание ногтей в Самаре — AG Nails',
    description:
      'Наращивание ногтей в Самаре от 2500 ₽, коррекция 2000 ₽. Санфировой 95/2, офис 616. Запись в DIKIDI.',
    h1: 'Наращивание ногтей в Самаре',
    intro: [
      'Наращивание от 2500 ₽, коррекция 2000 ₽. Длину и форму обсуждаем до начала работы.',
      'Студия на Санфировой 95/2, офис 616. Запись онлайн в DIKIDI.',
    ],
    priceRows: [
      { name: 'Наращивание ногтей', price: '2500 ₽', duration: '2,5–3 ч' },
      { name: 'Коррекция', price: '2000 ₽', duration: '~2 ч' },
      { name: 'Френч / втирка', price: '200 ₽', duration: '+15–20 мин' },
      { name: 'Дизайны', price: '50–400 ₽', duration: '+15–40 мин' },
      { name: 'Снятие без покрытия', price: '400 ₽', duration: '~20 мин' },
    ],
    faq: [
      {
        q: 'Сколько длится наращивание?',
        a: 'Обычно 2,5–3 часа. Точное время зависит от длины и дизайна.',
      },
      {
        q: 'Нужна запись заранее?',
        a: 'Да, особенно на наращивание. Удобнее через DIKIDI.',
      },
      {
        q: 'Где студия?',
        a: 'Самара, ул. Санфировой, 95/2, офис 616, ТЦ «Охотный ряд».',
      },
    ],
    workImageIds: ['work-white', 'work-lines', 'palette-caramel', 'palette-wine'],
    ctaLabel: 'Записаться на наращивание',
    includeFaqJsonLd: true,
  },

  'dizayn-nogtey-samara': {
    slug: 'dizayn-nogtey-samara',
    title: 'Дизайн ногтей в Самаре — AG Nails',
    description:
      'Дизайн ногтей в Самаре: от 50 до 400 ₽, френч и втирка 200 ₽. Санфировой 95/2. Запись в DIKIDI.',
    h1: 'Дизайн ногтей в Самаре',
    intro: [
      'Дизайны от 50 до 400 ₽, френч и втирка — 200 ₽. Можно добавить к маникюру или коррекции.',
      'Примеры работ — на сайте и во ВКонтакте. Запись в DIKIDI.',
    ],
    priceRows: [
      { name: 'Дизайны', price: '50–400 ₽', duration: '+15–40 мин' },
      { name: 'Френч / втирка', price: '200 ₽', duration: '+15–20 мин' },
      { name: 'Коррекция', price: '2000 ₽', duration: '~2 ч' },
      { name: 'Наращивание ногтей', price: '2500 ₽', duration: '2,5–3 ч' },
    ],
    faq: [
      {
        q: 'Сколько стоит дизайн?',
        a: 'От 50 до 400 ₽ — зависит от сложности. Френч и втирка — 200 ₽.',
      },
      {
        q: 'Можно принести референс?',
        a: 'Да, покажите фото при записи или в студии — подскажем, что реально сделать за визит.',
      },
      {
        q: 'Как записаться?',
        a: 'В DIKIDI или по телефону +7 977 053-11-89.',
      },
    ],
    workImageIds: ['palette-bright', 'palette-glitter', 'palette-chameleon', 'work-lines'],
    ctaLabel: 'Записаться с дизайном',
    includeFaqJsonLd: true,
  },

  tseny: {
    slug: 'tseny',
    title: 'Цены на маникюр и педикюр в Самаре — AG Nails',
    description:
      'Прайс AG Nails в Самаре: наращивание 2500 ₽, коррекция 2000 ₽, маникюр без покрытия 1500 ₽, педикюр от 1500 ₽. Запись в DIKIDI.',
    h1: 'Цены AG Nails',
    intro: [
      'Актуальный прайс студии на Санфировой 95/2. Доплата с 3 длины — 100 ₽ за каждый размер.',
      'Время визита зависит от услуги. Свободные окна видны при записи в DIKIDI.',
    ],
    priceRows: [
      { name: 'Наращивание ногтей', price: '2500 ₽', duration: '2,5–3 ч' },
      { name: 'Коррекция', price: '2000 ₽', duration: '~2 ч' },
      { name: 'Маникюр без покрытия', price: '1500 ₽', duration: '~1 ч' },
      { name: 'Педикюр — полный комплекс', price: '2000 ₽', duration: '~1,5 ч' },
      { name: 'Экспресс-педикюр', price: '1700 ₽', duration: '~1 ч' },
      { name: 'Педикюр без покрытия', price: '1500 ₽', duration: '~1 ч' },
      { name: 'SPA-уход', price: '400 ₽', duration: '+15–20 мин' },
      { name: 'Френч / втирка', price: '200 ₽', duration: '+15–20 мин' },
      { name: 'Дизайны', price: '50–400 ₽', duration: '+15–40 мин' },
      { name: 'Снятие без покрытия', price: '400 ₽', duration: '~20 мин' },
    ],
    faq: [
      {
        q: 'Цены фиксированные?',
        a: 'Да, по прайсу. Доплата только за длину с 3 размера — 100 ₽ за шаг.',
      },
      {
        q: 'Как оплатить?',
        a: 'На месте после услуги. Запись — в DIKIDI или по телефону.',
      },
    ],
    workImageIds: ['work-white', 'palette-caramel', 'work-lines', 'palette-wine'],
    ctaLabel: 'Выбрать услугу и записаться',
    includeFaqJsonLd: false,
  },

  kontakty: {
    slug: 'kontakty',
    title: 'Контакты AG Nails в Самаре',
    description:
      'AG Nails, Самара: ул. Санфировой, 95/2, офис 616. Телефон +7 977 053-11-89. Ежедневно 8:00–23:00. Запись в DIKIDI.',
    h1: 'Контакты',
    intro: [
      'Самара, ул. Санфировой, 95/2, офис 616 (5 этаж), ТЦ «Охотный ряд». Ежедневно 8:00–23:00 по записи.',
      'Запись в DIKIDI. Вопросы по длине, дизайну или проезду — по телефону или в мессенджер.',
    ],
    priceRows: [
      { name: 'Наращивание ногтей', price: '2500 ₽', duration: '2,5–3 ч' },
      { name: 'Коррекция', price: '2000 ₽', duration: '~2 ч' },
      { name: 'Маникюр без покрытия', price: '1500 ₽', duration: '~1 ч' },
      { name: 'Педикюр — полный комплекс', price: '2000 ₽', duration: '~1,5 ч' },
      { name: 'Экспресс-педикюр', price: '1700 ₽', duration: '~1 ч' },
    ],
    faq: [
      {
        q: 'Как добраться?',
        a: 'Санфировой 95/2, ТЦ «Охотный ряд», 5 этаж, офис 616. Маршрут — в Яндекс Картах на странице.',
      },
      {
        q: 'Какой график?',
        a: 'Ежедневно 8:00–23:00, только по предварительной записи.',
      },
      {
        q: 'Есть онлайн-запись?',
        a: 'Да, DIKIDI. Телефон: +7 977 053-11-89.',
      },
    ],
    workImageIds: ['work-white', 'work-lines', 'palette-bright'],
    ctaLabel: 'Записаться онлайн',
    includeFaqJsonLd: false,
  },
};
export const SEO_LANDING_SLUGS = Object.keys(SEO_LANDINGS) as SeoLandingSlug[];

export function getSeoLanding(slug: SeoLandingSlug): SeoLanding {
  return SEO_LANDINGS[slug];
}

export function buildSeoMetadata(landing: SeoLanding): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = new URL(`/${landing.slug}`, siteUrl).toString();

  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: landing.title,
      description: landing.description,
      images: [{ url: '/og.png', width: 1731, height: 909, alt: 'AG Nails — Самара' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: landing.title,
      description: landing.description,
      images: ['/og.png'],
    },
  };
}
