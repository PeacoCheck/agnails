import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-session';
import { verifySameOrigin } from '@/lib/admin-security';
import { adminConfig } from '@/lib/site-config';
import { processAndSaveWorkPhoto } from '@/lib/site-content';

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: 'Недействительный источник запроса.' }, { status: 403 });
  }

  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Доступ запрещён. Требуется авторизация.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') || 'Новая работа');
    const alt = String(formData.get('alt') || title);

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Файл изображения не передан.' }, { status: 400 });
    }

    if (file.size > adminConfig.maxUploadBytes) {
      return NextResponse.json({ error: 'Размер файла превышает лимит 5 МБ.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const savedPhoto = await processAndSaveWorkPhoto(buffer, title, alt);
    revalidatePath('/');

    return NextResponse.json({ ok: true, photo: savedPhoto });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка при обработке изображения.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
