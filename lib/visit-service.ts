import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export type SiteVisit = {
  id: string;
  timestamp: string;
  ip: string;
  path: string;
  referer: string;
  device: string;
  browser: string;
  country?: string;
};

export type VisitStats = {
  total: number;
  today: number;
  uniqueIps: number;
  visits: SiteVisit[];
};

const DATA_DIR = path.join(process.cwd(), 'data');
const VISITS_FILE = path.join(DATA_DIR, 'site-visits.json');
const MAX_LOGS = 800;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(VISITS_FILE)) {
    const initial: VisitStats = { total: 0, today: 0, uniqueIps: 0, visits: [] };
    fs.writeFileSync(VISITS_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readStats(): VisitStats {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8')) as VisitStats;
  } catch {
    return { total: 0, today: 0, uniqueIps: 0, visits: [] };
  }
}

function writeStats(stats: VisitStats) {
  ensureFile();
  const tmp = `${VISITS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, VISITS_FILE);
}

function parseUa(ua: string): { device: string; browser: string } {
  const u = ua || '';
  let device = 'ПК / другое';
  if (/iPhone|iPad|iPod/i.test(u)) device = 'iPhone / iPad';
  else if (/Android/i.test(u)) device = 'Android';
  else if (/Mobile/i.test(u)) device = 'Мобильный';

  let browser = 'Другой';
  if (/Edg\//i.test(u)) browser = 'Edge';
  else if (/YaBrowser|Yandex/i.test(u)) browser = 'Яндекс';
  else if (/Chrome/i.test(u) && !/Chromium/i.test(u)) browser = 'Chrome';
  else if (/Safari/i.test(u) && !/Chrome/i.test(u)) browser = 'Safari';
  else if (/Firefox/i.test(u)) browser = 'Firefox';
  else if (/VK\//i.test(u) || /vk_app/i.test(u)) browser = 'VK';
  else if (/Telegram/i.test(u)) browser = 'Telegram';

  return { device, browser };
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function getVisitStats(): VisitStats {
  const stats = readStats();
  const unique = new Set(stats.visits.map((v) => v.ip));
  return {
    ...stats,
    today: stats.visits.filter((v) => isToday(v.timestamp)).length,
    uniqueIps: unique.size,
  };
}

export function recordVisit(input: {
  ip: string;
  path?: string;
  referer?: string;
  userAgent?: string;
}): SiteVisit | null {
  const ip = (input.ip || '').trim() || 'unknown';
  // ignore local/health bots lightly
  const pathName = (input.path || '/').slice(0, 200);
  if (pathName.startsWith('/api/') || pathName.startsWith('/admin') || pathName.startsWith('/_next')) {
    return null;
  }

  const { device, browser } = parseUa(input.userAgent || '');
  const visit: SiteVisit = {
    id: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    ip,
    path: pathName,
    referer: (input.referer || '').slice(0, 300),
    device,
    browser,
  };

  const stats = readStats();
  // debounce same IP+path within 2 minutes
  const recent = stats.visits[0];
  if (
    recent &&
    recent.ip === visit.ip &&
    recent.path === visit.path &&
    Date.now() - new Date(recent.timestamp).getTime() < 2 * 60 * 1000
  ) {
    return recent;
  }

  stats.visits.unshift(visit);
  if (stats.visits.length > MAX_LOGS) stats.visits = stats.visits.slice(0, MAX_LOGS);
  stats.total += 1;
  writeStats(stats);
  return visit;
}
