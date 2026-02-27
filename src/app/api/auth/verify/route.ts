import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken, createSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const email = req.nextUrl.searchParams.get('email') || '';

  const verified = await verifyMagicToken(token);
  if (!verified || verified !== email) {
    return NextResponse.redirect(new URL('/?auth=invalid', req.url));
  }

  const session = await createSession(email);
  const res = NextResponse.redirect(new URL('/?auth=success', req.url));
  res.cookies.set('session', session, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return res;
}
