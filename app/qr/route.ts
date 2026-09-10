import { NextRequest, NextResponse } from 'next/server';
import { recordQrScan } from '@/lib/qr-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const src = url.searchParams.get('src') || url.searchParams.get('source') || 'mirror';

  // Extract client IP
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';

  const userAgent = req.headers.get('user-agent') || '';
  const referer = req.headers.get('referer') || '';

  // Record scan in persistent analytics database
  await recordQrScan({
    ip: clientIp,
    userAgent,
    source: src,
    referer,
  });

  // Redirect to canonical HTTPS landing page with offline tracking UTM parameters
  const redirectUrl = new URL('/', 'https://agnails.ru');
  redirectUrl.searchParams.set('utm_source', 'qr_offline');
  redirectUrl.searchParams.set('utm_medium', 'beauty_qr');
  redirectUrl.searchParams.set('utm_campaign', 'salon_mirror');
  redirectUrl.searchParams.set('qr_scan', '1');
  redirectUrl.searchParams.set('qr_src', src);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}
