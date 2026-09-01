import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { verifySameOrigin } from '@/lib/admin-security';
import {
  getPromoCodes,
  savePromoCodes,
  getRecentActivationLogs,
  getBannedIps,
  setIpBanned,
  type PromoCode,
} from '@/lib/promo-service';

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Не авторизован.' }, { status: 401 });
  }

  try {
    const promos = await getPromoCodes();
    const logs = await getRecentActivationLogs(300);
    const bannedIps = await getBannedIps();

    const stats = {
      totalActivations: logs.length,
      successfulActivations: logs.filter((l) => l.success).length,
      fraudAttempts: logs.filter((l) => l.riskLevel === 'high').length,
      suspiciousAttempts: logs.filter((l) => l.riskLevel === 'medium').length,
      bannedIpsCount: bannedIps.length,
    };

    return NextResponse.json({ ok: true, promos, logs, bannedIps, stats });
  } catch {
    return NextResponse.json({ error: 'Ошибка при загрузке промокодов.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Не авторизован.' }, { status: 401 });
  }
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: 'Недействительный источник запроса.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'ban_ip') {
      const ip = String(body.ip || '').trim();
      if (!ip) return NextResponse.json({ error: 'Укажите IP.' }, { status: 400 });
      const updatedBanned = await setIpBanned(ip, true);
      const logs = await getRecentActivationLogs(300);
      return NextResponse.json({ ok: true, bannedIps: updatedBanned, logs });
    }

    if (action === 'unban_ip') {
      const ip = String(body.ip || '').trim();
      if (!ip) return NextResponse.json({ error: 'Укажите IP.' }, { status: 400 });
      const updatedBanned = await setIpBanned(ip, false);
      const logs = await getRecentActivationLogs(300);
      return NextResponse.json({ ok: true, bannedIps: updatedBanned, logs });
    }

    if (action === 'save_promos') {
      const updated = await savePromoCodes(body.promos as PromoCode[]);
      return NextResponse.json({ ok: true, promos: updated });
    }

    if (action === 'create_promo') {
      const promos = await getPromoCodes();
      const newPromo: PromoCode = {
        code: String(body.code || '').trim().toUpperCase(),
        discount: String(body.discount || '').trim(),
        dikidiUrl: String(body.dikidiUrl || '').trim() || undefined,
        maxUses: body.maxUses ? Number(body.maxUses) : undefined,
        usedCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
        description: String(body.description || '').trim() || undefined,
      };

      if (!newPromo.code || !newPromo.discount) {
        return NextResponse.json({ error: 'Укажите код и описание скидки.' }, { status: 400 });
      }

      if (promos.some((p) => p.code.toUpperCase() === newPromo.code)) {
        return NextResponse.json({ error: 'Промокод с таким названием уже существует.' }, { status: 400 });
      }

      promos.unshift(newPromo);
      const updated = await savePromoCodes(promos);
      return NextResponse.json({ ok: true, promos: updated });
    }

    return NextResponse.json({ error: 'Неизвестное действие.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера при сохранении промокода.' }, { status: 500 });
  }
}
