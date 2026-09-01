import { z } from 'zod';

const shortText = z.string().trim().min(1).max(160);
const mediumText = z.string().trim().min(1).max(600);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const publicImagePath = z.string().regex(/^\/images\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp)$/i);

export const siteContentSchema = z.object({
  business: z.object({
    name: shortText,
    masterName: shortText,
    city: shortText,
    phoneDisplay: z.string().trim().min(5).max(40),
    phoneE164: z.string().regex(/^\+[1-9]\d{7,14}$/),
    workingHours: z.object({
      label: shortText,
      opens: time,
      closes: time,
    }),
    address: z.object({
      streetAddress: shortText,
      shortAddress: shortText,
      details: shortText,
      landmark: shortText,
      locality: shortText,
      country: z.string().length(2),
    }),
    rating: z.object({
      value: z.string().regex(/^\d(?:\.\d)?$/),
      reviewCount: z.number().int().nonnegative().max(100000),
      ratingCount: z.number().int().nonnegative().max(100000),
    }),
    priceRange: shortText,
  }),
  hero: z.object({
    eyebrow: shortText,
    titleLine1: shortText,
    titleLine2: shortText,
    description: mediumText,
  }),
  copy: z.object({
    worksTitle: shortText,
    worksDescription: mediumText,
    pricesTitle: shortText,
    pricesDescription: mediumText,
    priceNote: mediumText,
    locationTitle: shortText,
    locationDescription: mediumText,
    bookingTitle: shortText,
    bookingDescription: mediumText,
    footerText: shortText,
  }),
  links: z.object({
    dikidi: z.string().url(),
    vk: z.string().url(),
    telegram: z.string().url(),
    max: z.string().url(),
    whatsapp: z.string().url(),
    yandexMaps: z.string().url(),
    yandexMapWidget: z.string().url(),
  }),
  works: z.array(z.object({
    src: publicImagePath,
    title: shortText,
    alt: shortText,
  })).min(1).max(50),
  priceGroups: z.array(z.object({
    title: shortText,
    items: z.array(z.object({
      name: shortText,
      price: z.string().trim().min(1).max(40),
    })).min(1).max(30),
  })).min(1).max(12),
  reviews: z.array(z.object({
    name: shortText,
    date: shortText,
    service: shortText,
    text: mediumText,
    rating: z.number().int().min(1).max(5),
  })).min(1).max(30),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  throw new Error('Введите телефон в международном формате, например +7 999 123-45-67.');
}

export function parseWorkingHours(label: string) {
  const matches = label.match(/([01]\d|2[0-3]):[0-5]\d/g);
  if (matches && matches.length >= 2) {
    return { opens: matches[0], closes: matches[1] };
  }
  return { opens: '10:00', closes: '20:00' };
}

