export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createMagicToken } from '@/lib/auth';

const SENDGRID_LIST_ID = 'f776877f-7764-467e-b6f7-b36270d19f0b';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@stocksonsolana.com';
const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://stocksonsolana.com';

async function addToSendGridList(email: string) {
  try {
    await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ list_ids: [SENDGRID_LIST_ID], contacts: [{ email }] }),
    });
  } catch { /* non-blocking */ }
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const token = await createMagicToken(email);
  const magicUrl = `${BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  addToSendGridList(email); // non-blocking

  const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: SENDGRID_FROM, name: 'Stocks on Solana' },
      subject: 'Your Stocks on Solana login link',
      content: [{ type: 'text/html', value: `
        <div style="background:#0a0a0a;color:#e0e0e0;padding:40px;font-family:monospace;max-width:500px">
          <h1 style="color:#FF9900;letter-spacing:2px;font-size:18px;margin-bottom:4px">STOCKS ON SOLANA</h1>
          <p style="color:#555;font-size:11px;letter-spacing:2px;margin-top:0">REAL-TIME TOKENIZED EQUITY SCREENER</p>
          <hr style="border:none;border-top:1px solid #1e1e1e;margin:24px 0"/>
          <p style="color:#aaa;font-size:13px">Click to sign in. Link expires in 15 minutes.</p>
          <a href="${magicUrl}" style="display:inline-block;background:#FF9900;color:#000;padding:12px 24px;text-decoration:none;font-weight:700;letter-spacing:1px;border-radius:4px;margin:16px 0;font-size:12px">SIGN IN</a>
          <p style="color:#555;font-size:11px;margin-top:24px">If you didn't request this, ignore it.</p>
        </div>
      ` }],
    }),
  });

  if (!sgRes.ok) {
    const err = await sgRes.text();
    console.error('SendGrid error:', sgRes.status, err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
