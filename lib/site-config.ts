// SEO URLs must always refer to the public site. A local NEXT_PUBLIC_SITE_URL
// can otherwise leak into canonical links, the sitemap and structured data.
const publicSiteUrl = 'https://agnails.ru/';

export function getSiteUrl() {
  return publicSiteUrl;
}

export function getYandexMetrikaId() {
  const value = process.env.NEXT_PUBLIC_YM_ID?.trim() || '';
  return /^\d+$/.test(value) ? value : null;
}

export const adminConfig = {
  sessionCookie: 'ag_admin_session',
  sessionHours: 24,
  maxUploadBytes: 5 * 1024 * 1024,
};
