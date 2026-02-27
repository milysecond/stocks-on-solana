import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignJWT } from 'jose';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) return NextResponse.redirect(new URL('/?error=invalid', req.url));

  const now = Math.floor(Date.now() / 1000);
  const result = await db.execute({
    sql: `SELECT * FROM magic_links WHERE token = ? AND email = ? AND expires_at > ? AND used = 0 LIMIT 1`,
    args: [token, email, now],
  });

  if (result.rows.length === 0) return NextResponse.redirect(new URL('/?error=expired', req.url));

  // Mark used
  await db.execute({ sql: `UPDATE magic_links SET used = 1 WHERE token = ?`, args: [token] });

  // Upsert user
  const userId = randomUUID();
  await db.execute({
    sql: `INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)`,
    args: [userId, email],
  });
  const user = await db.execute({ sql: `SELECT id FROM users WHERE email = ?`, args: [email] });
  const uid = user.rows[0].id as string;

  // Sign JWT
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const jwt = await new SignJWT({ sub: uid, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);

  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.set('session', jwt, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
