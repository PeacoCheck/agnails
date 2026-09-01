const fallbackSiteUrl = 'http://78.17.74.215/';

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallbackSiteUrl;
  try {
    return new URL(value.endsWith('/') ? value : `${value}/`).toString();
  } catch {
    return fallbackSiteUrl;
  }
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

