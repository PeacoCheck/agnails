import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { getVisitStats } from '@/lib/visit-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isAuth = await requireAdmin(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getVisitStats());
}
