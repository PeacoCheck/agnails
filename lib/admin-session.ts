import fs from 'node:fs';
import path from 'node:path';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { NextRequest, NextResponse } from 'next/server';
import { adminConfig } from './site-config';

const issuer = 'ag-nails-admin';
const audience = 'ag-nails-admin-panel';
const defaultDevSecret = 'ag-nails-super-secure-production-jwt-session-secret-key-samara-2026';

function readEnvVar(name: string): string {
  for (const filename of ['.env.production', '.env.local', '.env']) {
    try {
      const filePath = path.join(process.cwd(), filename);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const regex = new RegExp(`^\\s*${name}\\s*=\\s*(.+)$`, 'm');
        const match = raw.match(regex);
        if (match && match[1]) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    } catch {
      // ignore
    }
  }

  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;

  return '';
}


function getSessionSecret() {
  const value = readEnvVar('ADMIN_SESSION_SECRET') || defaultDevSecret;
  return new TextEncoder().encode(value);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminSecret = readEnvVar('ADMIN_PASSWORD');
  console.log('[DEBUG_AUTH] Input password length:', password?.length, 'adminSecret found:', Boolean(adminSecret), 'startsWith $2:', adminSecret?.startsWith('$2'));
  if (!adminSecret) return false;
  if (adminSecret.startsWith('$2a$') || adminSecret.startsWith('$2b$') || adminSecret.startsWith('$2y$')) {
    const matched = await bcrypt.compare(password, adminSecret);
    console.log('[DEBUG_AUTH] bcrypt matched:', matched);
    return matched;
  }
  const matched = password === adminSecret;
  console.log('[DEBUG_AUTH] plaintext matched:', matched);
  return matched;
}



export async function createAdminToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${adminConfig.sessionHours}h`)
    .sign(getSessionSecret());
}

export async function verifyAdminToken(token?: string) {
  if (!token) return false;
  try {
    const result = await jwtVerify(token, getSessionSecret(), { issuer, audience });
    return result.payload.sub === 'admin' && result.payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function requireAdmin(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(adminConfig.sessionCookie)?.value);
}

export function setAdminCookie(response: NextResponse, token: string, request?: NextRequest) {
  const isHttps = request
    ? request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://')
    : process.env.COOKIE_SECURE === 'true';

  response.cookies.set(adminConfig.sessionCookie, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: adminConfig.sessionHours * 60 * 60,
    priority: 'high',
  });
}

export function clearAdminCookie(response: NextResponse, request?: NextRequest) {
  const isHttps = request
    ? request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://')
    : process.env.COOKIE_SECURE === 'true';

  response.cookies.set(adminConfig.sessionCookie, '', {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}


