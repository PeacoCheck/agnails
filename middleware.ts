import { NextRequest, NextResponse } from 'next/server';

const PRIMARY_HOST = 'agnails.ru';
const WWW_HOST = 'www.agnails.ru';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase();

  if (host === WWW_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = PRIMARY_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
