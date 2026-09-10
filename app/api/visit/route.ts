import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/visit-service';

export const dynamic = 'force-dynamic';

function clientIp(req: NextRequest) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || 'unknown';
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const visit = recordVisit({
      ip: clientIp(req),
      path: typeof body.path === 'string' ? body.path : '/',
      referer: typeof body.referer === 'string' ? body.referer : req.headers.get('referer') || '',
      userAgent: req.headers.get('user-agent') || '',
    });
    return NextResponse.json({ ok: true, id: visit?.id || null });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
