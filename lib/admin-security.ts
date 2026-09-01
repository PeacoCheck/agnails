import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { NextRequest } from 'next/server';

type Attempt = { failures: number; blockedUntil: number; series: number; lastSeen: number };
const attempts = new Map<string, Attempt>();
const logDirectory = path.join(process.cwd(), 'logs');
const loginLog = path.join(logDirectory, 'admin-login.log');

export function getClientIp(request: NextRequest) {
  return (request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown')
    .trim().slice(0, 80);
}

export function verifySameOrigin(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
      if (
        (originHost.startsWith('localhost') || originHost.startsWith('127.0.0.1')) &&
        (host.startsWith('localhost') || host.startsWith('127.0.0.1'))
      ) {
        return true;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) return true;
      if (
        (refererHost.startsWith('localhost') || refererHost.startsWith('127.0.0.1')) &&
        (host.startsWith('localhost') || host.startsWith('127.0.0.1'))
      ) {
        return true;
      }
    } catch {
      return false;
    }
  }

  if (!origin && !referer) {
    return true;
  }

  return false;
}


export function checkLoginRateLimit(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current) return { allowed: true, retryAfter: 0 };
  if (now - current.lastSeen > 24 * 60 * 60 * 1000) {
    attempts.delete(ip);
    return { allowed: true, retryAfter: 0 };
  }
  if (current.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((current.blockedUntil - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

export function registerLoginAttempt(ip: string, success: boolean) {
  if (success) {
    attempts.delete(ip);
    return;
  }
  const now = Date.now();
  const current = attempts.get(ip) || { failures: 0, blockedUntil: 0, series: 0, lastSeen: now };
  current.failures += 1;
  current.lastSeen = now;
  if (current.failures >= 5) {
    current.series += 1;
    current.failures = 0;
    current.blockedUntil = now + Math.min(5 * 2 ** (current.series - 1), 60) * 60 * 1000;
  }
  attempts.set(ip, current);
}

export async function logLoginAttempt(ip: string, success: boolean, detail: string) {
  await mkdir(logDirectory, { recursive: true });
  const entry = JSON.stringify({ time: new Date().toISOString(), ip, success, detail: detail.slice(0, 120) });
  await appendFile(loginLog, `${entry}\n`, { encoding: 'utf8', mode: 0o600 });
}
