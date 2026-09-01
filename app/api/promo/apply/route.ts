import { NextRequest, NextResponse } from 'next/server';
import { applyPromo } from '@/lib/promo-service';
import { getClientIp, verifySameOrigin } from '@/lib/admin-security';

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: 'Недействительный источник запроса.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const code = String(body.code || '').trim();

    if (!code) {
      return NextResponse.json({ error: 'Пожалуйста, введите промокод.' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const acceptLanguage = request.headers.get('accept-language') || '';

    const result = await applyPromo(code, ip, userAgent, acceptLanguage);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.message,
          riskLevel: result.riskLevel,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      code: result.code,
      discount: result.discount,
      dikidiUrl: result.dikidiUrl,
      message: result.message,
    });
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера при проверке промокода.' }, { status: 500 });
  }
}
