import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { getQrStats, generateBeautyQrSvg, generateBeautyQrDataUrl } from '@/lib/qr-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isAuth = await requireAdmin(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const theme = (req.nextUrl.searchParams.get('theme') as 'nude' | 'dark') || 'nude';
  const qrTargetUrl = 'https://agnails.ru/qr';

  const stats = getQrStats();
  const svg = await generateBeautyQrSvg(qrTargetUrl, theme);
  const dataUrl = await generateBeautyQrDataUrl(qrTargetUrl, theme);

  return NextResponse.json({
    stats,
    qr: {
      targetUrl: qrTargetUrl,
      svg,
      dataUrl,
      theme,
    },
  });
}
