export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  if (!session) return NextResponse.json({ user: null });
  const user = await verifySession(session);
  return NextResponse.json({ user });
}
