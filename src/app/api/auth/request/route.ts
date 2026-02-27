import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import sgMail from '@sendgrid/mail';
import { randomUUID } from 'crypto';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

function generateToken() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const token = generateToken();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 15; // 15 min

  await db.execute({
    sql: `INSERT INTO magic_links (id, email, token, expires_at) VALUES (?, ?, ?, ?)`,
    args: [randomUUID(), email, token, expiresAt],
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_URL || 'https://stocksonsolana.com'}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM!,
    subject: 'Your Stocks on Solana login link',
    html: `
      <div style="background:#0a0a0a;color:#e0e0e0;padding:40px;font-family:monospace;max-width:500px">
        <h1 style="color:#FF9900;letter-spacing:2px;font-size:18px">STOCKS ON SOLANA</h1>
        <p style="color:#888;font-size:13px">Your magic login link:</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#FF9900;color:#000;padding:12px 24px;text-decoration:none;font-weight:700;letter-spacing:1px;border-radius:4px;margin:16px 0">ACCESS TERMINAL</a>
        <p style="color:#555;font-size:11px">Link expires in 15 minutes. If you didn't request this, ignore it.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
