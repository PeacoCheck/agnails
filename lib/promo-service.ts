import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { z } from 'zod';

export interface PromoCode {
  code: string;
  discount: string;
  dikidiUrl?: string;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
  description?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ActivationLog {
  id: string;
  timestamp: string;
  code: string;
  success: boolean;
  ip: string;
  userAgent: string;
  fingerprint: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  riskReasons: string[];
  error?: string;
  discount?: string;
  isBanned?: boolean;
}

const promosFilePath = path.join(process.cwd(), 'content', 'promos.json');
const bannedIpsPath = path.join(process.cwd(), 'content', 'banned-ips.json');
const logsDirectory = path.join(process.cwd(), 'logs');
const activationLogsPath = path.join(logsDirectory, 'promo-activations.jsonl');

const promoSchema = z.object({
  code: z.string().trim().min(2).max(30),
  discount: z.string().trim().min(1).max(100),
  dikidiUrl: z.string().trim().url().optional().or(z.literal('')),
  maxUses: z.number().int().positive().optional(),
  usedCount: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  createdAt: z.string(),
  description: z.string().trim().max(200).optional(),
});

const promosArraySchema = z.array(promoSchema);

const defaultPromos: PromoCode[] = [
  {
    code: 'HELLO',
    discount: 'Скидка 10% на первый визит',
    dikidiUrl: 'https://dikidi.net/ru/profile/anastasiya_1643065',
    maxUses: 100,
    usedCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
    description: 'Приветственный промокод для новых клиентов из рекламы',
  },
];

export async function getBannedIps(): Promise<string[]> {
  try {
    if (!existsSync(bannedIpsPath)) return [];
    const raw = await readFile(bannedIpsPath, 'utf8');
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function setIpBanned(ip: string, ban: boolean): Promise<string[]> {
  const current = await getBannedIps();
  let updated: string[];
  if (ban) {
    updated = Array.from(new Set([...current, ip]));
  } else {
    updated = current.filter((item) => item !== ip);
  }
  await mkdir(path.dirname(bannedIpsPath), { recursive: true });
  await writeFile(bannedIpsPath, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    if (!existsSync(promosFilePath)) {
      await mkdir(path.dirname(promosFilePath), { recursive: true });
      await writeFile(promosFilePath, JSON.stringify(defaultPromos, null, 2), 'utf8');
      return defaultPromos;
    }
    const raw = await readFile(promosFilePath, 'utf8');
    return promosArraySchema.parse(JSON.parse(raw));
  } catch {
    return defaultPromos;
  }
}

export async function savePromoCodes(promos: PromoCode[]): Promise<PromoCode[]> {
  const validated = promosArraySchema.parse(promos);
  await mkdir(path.dirname(promosFilePath), { recursive: true });
  await writeFile(promosFilePath, JSON.stringify(validated, null, 2), 'utf8');
  return validated;
}

export async function getRecentActivationLogs(limit = 200): Promise<ActivationLog[]> {
  try {
    if (!existsSync(activationLogsPath)) return [];
    const raw = await readFile(activationLogsPath, 'utf8');
    const lines = raw.trim().split('\n').filter(Boolean);
    const bannedIps = new Set(await getBannedIps());
    const logs: ActivationLog[] = [];
    for (let i = lines.length - 1; i >= 0 && logs.length < limit; i--) {
      try {
        const item: ActivationLog = JSON.parse(lines[i]);
        item.isBanned = bannedIps.has(item.ip);
        logs.push(item);
      } catch {
        // ignore malformed line
      }
    }
    return logs;
  } catch {
    return [];
  }
}

export function generateDeviceFingerprint(ip: string, userAgent: string, acceptLanguage = ''): string {
  const payload = `${ip.trim()}|${userAgent.trim()}|${acceptLanguage.trim()}`;
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

/**
 * Smart / Machine Learning Anomaly & Anti-Fraud Risk Scoring Algorithm
 * Tracks:
 * - Same-day re-entry: ALLOWED and treated as same visit consideration.
 * - Historical re-entry (> 24 hours / months later): Detected as repeat visitor.
 * - Manual IP ban: Handled strictly.
 */
export async function calculateRiskScore(
  ip: string,
  fingerprint: string,
  code: string,
  recentLogs: ActivationLog[],
  isBanned: boolean
): Promise<{
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  isRepeatCustomer: boolean;
}> {
  let score = 5;
  const reasons: string[] = [];
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  if (isBanned) {
    return {
      riskScore: 100,
      riskLevel: 'high',
      riskReasons: ['IP заблокирован вручную администратором'],
      isRepeatCustomer: true,
    };
  }

  const ipLogs = recentLogs.filter((l) => l.ip === ip && l.code.toUpperCase() === code.toUpperCase() && l.success);
  const olderThan1DaySuccess = ipLogs.filter((l) => now - new Date(l.timestamp).getTime() > ONE_DAY_MS);
  const sameDaySuccess = ipLogs.filter((l) => now - new Date(l.timestamp).getTime() <= ONE_DAY_MS);

  let isRepeatCustomer = false;

  if (olderThan1DaySuccess.length > 0) {
    // Used in previous days / previous months
    isRepeatCustomer = true;
    score = 85;
    reasons.push(`Использовал промокод ${olderThan1DaySuccess.length} раз в прошлые дни/месяцы`);
  } else if (sameDaySuccess.length > 0) {
    // Normal same-day consideration (re-entering 2-4 times today while thinking about booking)
    score = 15;
    reasons.push(`Повторный ввод в течение сегодняшнего дня (${sameDaySuccess.length + 1}-й раз за 24 ч — разрешено)`);
  }

  // Check rate frequency in last 1 hour (> 10 requests is a bot)
  const recentAttempts1h = recentLogs.filter((l) => l.ip === ip && now - new Date(l.timestamp).getTime() < 60 * 60 * 1000);
  if (recentAttempts1h.length >= 10) {
    score += 40;
    reasons.push(`Аномально высокая частота запросов (${recentAttempts1h.length} раз за час)`);
  }

  score = Math.min(Math.max(score, 0), 100);

  let riskLevel: RiskLevel = 'low';
  if (score >= 70) {
    riskLevel = 'high';
  } else if (score >= 35) {
    riskLevel = 'medium';
  }

  if (reasons.length === 0) {
    reasons.push('Первый визит (Новый клиент)');
  }

  return { riskScore: score, riskLevel, riskReasons: reasons, isRepeatCustomer };
}

export async function applyPromo(
  rawCode: string,
  ip: string,
  userAgent: string,
  acceptLanguage = ''
): Promise<{
  ok: boolean;
  code?: string;
  discount?: string;
  dikidiUrl?: string;
  message: string;
  riskScore: number;
  riskLevel: RiskLevel;
}> {
  const normalizedCode = (rawCode || '').trim().toUpperCase();
  const fingerprint = generateDeviceFingerprint(ip, userAgent, acceptLanguage);
  const recentLogs = await getRecentActivationLogs(300);
  const bannedIps = new Set(await getBannedIps());
  const isBanned = bannedIps.has(ip);

  const riskAnalysis = await calculateRiskScore(ip, fingerprint, normalizedCode, recentLogs, isBanned);

  const promos = await getPromoCodes();
  const promo = promos.find((p) => p.code.toUpperCase() === normalizedCode);

  let success = false;
  let errorMessage = '';
  let discount = '';
  let dikidiUrl = '';

  if (isBanned) {
    errorMessage = 'Вы уже использовали этот промокод.';
  } else if (!promo) {
    errorMessage = 'Промокод не найден. Проверьте правильность написания.';
  } else if (!promo.active) {
    errorMessage = 'Срок действия этого промокода завершён.';
  } else if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    errorMessage = 'Лимит активаций этого промокода исчерпан.';
  } else if (riskAnalysis.isRepeatCustomer) {
    // Repeat customer from previous months/visits
    errorMessage = 'Вы уже использовали этот промокод ранее. Он действует только на первый визит.';
  } else {
    // Valid activation (new client OR same-day repeated entry)
    success = true;
    discount = promo.discount;
    dikidiUrl = promo.dikidiUrl || 'https://dikidi.net/ru/profile/anastasiya_1643065';
    
    promo.usedCount += 1;
    await savePromoCodes(promos);
  }

  // Record into audit log
  const logEntry: ActivationLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    code: normalizedCode,
    success,
    ip,
    userAgent: userAgent.slice(0, 150),
    fingerprint,
    riskScore: riskAnalysis.riskScore,
    riskLevel: riskAnalysis.riskLevel,
    riskReasons: riskAnalysis.riskReasons,
    error: errorMessage || undefined,
    discount: discount || undefined,
    isBanned,
  };

  await mkdir(logsDirectory, { recursive: true });
  await appendFile(activationLogsPath, `${JSON.stringify(logEntry)}\n`, 'utf8');

  return {
    ok: success,
    code: normalizedCode,
    discount,
    dikidiUrl,
    message: success ? `Промокод успешно применён! ${discount}` : errorMessage,
    riskScore: riskAnalysis.riskScore,
    riskLevel: riskAnalysis.riskLevel,
  };
}
