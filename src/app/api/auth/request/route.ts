export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createMagicToken } from '@/lib/auth';
import {
  parseEmail,
  resendConfigured,
  sendMagicLinkEmail,
  upsertMailingContact,
} from '@/lib/resend';

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://stocksonsolana.com';

export async function POST(req: NextRequest) {
  if (!resendConfigured()) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 503 }
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = parseEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const token = await createMagicToken(email);
  const magicUrl = `${BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  // Non-blocking audience sync (no-op on send-only keys)
  void upsertMailingContact(email);

  try {
    await sendMagicLinkEmail(email, magicUrl);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        detail,
        hasKey: resendConfigured(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
