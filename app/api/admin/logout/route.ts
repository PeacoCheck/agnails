import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/admin-session';
import { verifySameOrigin } from '@/lib/admin-security';

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: 'Недействительный источник запроса.' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  clearAdminCookie(response, request);
  return response;
}

