import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export interface QrScanLog {
  id: string;
  timestamp: string;
  ip: string;
  device: string; // e.g. "iPhone (iOS 17.5)", "Android (Samsung)", "ПК / Другое"
  browser: string; // e.g. "Mobile Safari", "Chrome Mobile", "VK App", "Telegram"
  source: string; // e.g. "mirror" (зеркало), "stand" (стойка), "card" (визитка)
  referer?: string;
}

export interface QrStats {
  totalScans: number;
  uniqueVisitors: number;
  scansToday: number;
  scansThisWeek: number;
  devices: {
    ios: number;
    android: number;
    other: number;
  };
  sources: Record<string, number>;
  logs: QrScanLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STATS_FILE = path.join(DATA_DIR, 'qr-scans.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STATS_FILE)) {
    const initial: QrStats = {
      totalScans: 0,
      uniqueVisitors: 0,
      scansToday: 0,
      scansThisWeek: 0,
      devices: { ios: 0, android: 0, other: 0 },
      sources: {},
      logs: [],
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function parseDevice(ua: string): { device: string; browser: string; type: 'ios' | 'android' | 'other' } {
  const uaLower = ua.toLowerCase();
  let type: 'ios' | 'android' | 'other' = 'other';
  let device = 'ПК / Другое';
  let browser = 'Браузер';

  // Device Detection
  if (/iphone/.test(uaLower)) {
    type = 'ios';
    const match = ua.match(/OS (\d+[_\d]*)/);
    const osVer = match ? match[1].replace(/_/g, '.') : '';
    device = `iPhone${osVer ? ` (iOS ${osVer})` : ''}`;
  } else if (/ipad/.test(uaLower)) {
    type = 'ios';
    device = 'iPad';
  } else if (/android/.test(uaLower)) {
    type = 'android';
    if (/samsung/.test(uaLower)) device = 'Android (Samsung)';
    else if (/xiaomi|redmi|poco/.test(uaLower)) device = 'Android (Xiaomi/Redmi)';
    else if (/huawei|honor/.test(uaLower)) device = 'Android (Huawei/Honor)';
    else device = 'Android (Смартфон)';
  } else if (/windows/.test(uaLower)) {
    device = 'Windows PC';
  } else if (/macintosh|mac os/.test(uaLower)) {
    device = 'MacBook / Mac';
  }

  // Browser / In-App App Detection
  if (/telegram/.test(uaLower)) browser = 'Telegram WebApp';
  else if (/vkapp|vkclient/.test(uaLower)) browser = 'VKontakte App';
  else if (/instagram/.test(uaLower)) browser = 'Instagram Browser';
  else if (/crios|chrome/.test(uaLower)) browser = 'Chrome';
  else if (/safari/.test(uaLower) && !/chrome|crios/.test(uaLower)) browser = 'Safari';
  else if (/firefox|fxios/.test(uaLower)) browser = 'Firefox';
  else if (/yabrowser/.test(uaLower)) browser = 'Яндекс Браузер';

  return { device, browser, type };
}

export async function recordQrScan(params: {
  ip: string;
  userAgent: string;
  source?: string;
  referer?: string;
}): Promise<void> {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf-8');
    const data: QrStats = JSON.parse(raw);

    const { device, browser, type } = parseDevice(params.userAgent || '');
    const source = params.source || 'mirror';

    const newLog: QrScanLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ip: params.ip || '127.0.0.1',
      device,
      browser,
      source,
      referer: params.referer || '',
    };

    data.totalScans += 1;
    data.devices[type] = (data.devices[type] || 0) + 1;
    data.sources[source] = (data.sources[source] || 0) + 1;

    // Add to logs (max 300 logs)
    data.logs.unshift(newLog);
    if (data.logs.length > 300) {
      data.logs = data.logs.slice(0, 300);
    }

    // Recompute unique and periods
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const uniqueIps = new Set<string>();
    let todayCount = 0;
    let weekCount = 0;

    for (const log of data.logs) {
      uniqueIps.add(log.ip);
      const logTime = new Date(log.timestamp).getTime();
      if (logTime >= startOfToday) todayCount++;
      if (logTime >= sevenDaysAgo) weekCount++;
    }

    data.uniqueVisitors = uniqueIps.size;
    data.scansToday = todayCount;
    data.scansThisWeek = weekCount;

    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error recording QR scan:', err);
  }
}

export function getQrStats(): QrStats {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      totalScans: 0,
      uniqueVisitors: 0,
      scansToday: 0,
      scansThisWeek: 0,
      devices: { ios: 0, android: 0, other: 0 },
      sources: {},
      logs: [],
    };
  }
}

/**
 * Generates an ultra-aesthetic Beauty QR Code SVG with embedded AG Nails Center Badge.
 */
export async function generateBeautyQrSvg(url: string, theme: 'nude' | 'dark' = 'nude'): Promise<string> {
  const isNude = theme === 'nude';
  const fgColor = isNude ? '#c4a574' : '#171817';
  const bgColor = '#ffffff';

  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: fgColor,
      light: bgColor,
    },
  });
}


/**
 * Generates PNG Data URL for direct image download.
 */
export async function generateBeautyQrDataUrl(url: string, theme: 'nude' | 'dark' = 'nude'): Promise<string> {
  const isNude = theme === 'nude';
  const fgColor = isNude ? '#c4a574' : '#171817';
  
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 600,
    color: {
      dark: fgColor,
      light: '#ffffff',
    },
  });
}
