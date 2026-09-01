import { NextRequest, NextResponse } from 'next/server';
import {
  checkLoginRateLimit,
  getClientIp,
  logLoginAttempt,
  registerLoginAttempt,
  verifySameOrigin,
} from '@/lib/admin-security';
import { createAdminToken, setAdminCookie, verifyAdminPassword } from '@/lib/admin-session';

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: 'Недействительный источник запроса (CSRF).' }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rateLimit = checkLoginRateLimit(ip);

  if (!rateLimit.allowed) {
    await logLoginAttempt(ip, false, 'Rate limit exceeded');
    return NextResponse.json(
      { error: `Слишком много попыток входа. Пожалуйста, подождите ${rateLimit.retryAfter} сек.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const password = String(body.password || '');

    if (!password) {
      return NextResponse.json({ error: 'Введите пароль.' }, { status: 400 });
    }

    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      registerLoginAttempt(ip, false);
      await logLoginAttempt(ip, false, 'Invalid password attempt');
      return NextResponse.json({ error: 'Неверный пароль администратора.' }, { status: 401 });
    }

    registerLoginAttempt(ip, true);
    await logLoginAttempt(ip, true, 'Successful login');

    const token = await createAdminToken();
    const response = NextResponse.json({ ok: true });
    setAdminCookie(response, token, request);
    return response;
  } catch {
    return NextResponse.json({ error: 'Ошибка при обработке запроса.' }, { status: 500 });
  }
}
