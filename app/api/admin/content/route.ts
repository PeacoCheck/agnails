import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-session';
import { verifySameOrigin } from '@/lib/admin-security';
import { getSiteContent, writeSiteContent } from '@/lib/site-content';

export async function GET(request: NextRequest) {
  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Доступ запрещён. Требуется авторизация.' }, { status: 401 });
  }

  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось прочитать контент.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: 'Недействительный источник запроса.' }, { status: 403 });
  }

  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Доступ запрещён. Требуется авторизация.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await writeSiteContent(body);
    revalidatePath('/');
    return NextResponse.json({ ok: true, content: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось сохранить изменения.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
