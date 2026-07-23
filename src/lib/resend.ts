/**
 * Resend helpers for Stocks on Solana.
 * Requires RESEND_API_KEY. From address must be verified on stocksonsolana.com.
 *
 * Full-access key: contacts, segments, broadcasts.
 * Send-only key: transactional mail (magic links, single welcome sends).
 */

const RESEND_API = 'https://api.resend.com';

export const RESEND_FROM =
  process.env.RESEND_FROM || 'Stocks on Solana <noreply@stocksonsolana.com>';

export const SITE_URL =
  process.env.NEXT_PUBLIC_URL || 'https://stocksonsolana.com';

/** Optional Resend audience segment for the mailing list. */
export const RESEND_SEGMENT_ID = process.env.RESEND_SEGMENT_ID || '';

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function parseEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (email.length > 254) return null;
  return email;
}

async function resendFetch(path: string, init: RequestInit = {}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  const res = await fetch(`${RESEND_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      (json.message as string) || (json.name as string) || `Resend ${res.status}`
    );
  }
  return json;
}

export type SendEmailOpts = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
  listUnsubscribe?: boolean;
};

export async function sendEmail(opts: SendEmailOpts) {
  const headers: Record<string, string> = {};
  if (opts.listUnsubscribe) {
    headers['List-Unsubscribe'] = `<${SITE_URL}/privacy>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  return resendFetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      from: RESEND_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo,
      headers: Object.keys(headers).length ? headers : undefined,
      tags: opts.tags,
    }),
  });
}

/** Batch send up to 100 emails (send-only keys supported). */
export async function sendEmailBatch(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>
) {
  if (!emails.length) return { data: [] };
  const payload = emails.map((e) => ({
    from: RESEND_FROM,
    to: [e.to],
    subject: e.subject,
    html: e.html,
    text: e.text,
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'product', value: 'stocks-on-solana' },
    ],
  }));
  return resendFetch('/emails/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type ResendContact = {
  id?: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  unsubscribed?: boolean;
};

/** List all contacts (requires full-access API key). */
export async function listAllContacts(): Promise<ResendContact[]> {
  const out: ResendContact[] = [];
  let after: string | undefined;
  for (let page = 0; page < 100; page++) {
    const qs = new URLSearchParams({ limit: '100' });
    if (after) qs.set('after', after);
    const res = await resendFetch(`/contacts?${qs.toString()}`);
    const data = (res.data as ResendContact[]) || [];
    out.push(...data);
    const hasMore = Boolean((res as { has_more?: boolean }).has_more);
    if (!hasMore || data.length === 0) break;
    after = (data[data.length - 1] as { id?: string }).id;
    if (!after) break;
  }
  return out;
}

/**
 * Best-effort: create/update Resend contact and add to segment.
 * Send-only API keys skip this silently.
 */
export async function upsertMailingContact(email: string): Promise<void> {
  const normalized = parseEmail(email);
  if (!normalized) return;

  try {
    await resendFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email: normalized,
        unsubscribed: false,
        ...(RESEND_SEGMENT_ID
          ? { segments: [{ id: RESEND_SEGMENT_ID }] }
          : {}),
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/already|exist|409|422/i.test(msg)) {
      try {
        await resendFetch(`/contacts/${encodeURIComponent(normalized)}`, {
          method: 'PATCH',
          body: JSON.stringify({ unsubscribed: false }),
        });
      } catch {
        /* ignore */
      }
    } else if (/restricted|unauthorized|401|403/i.test(msg)) {
      return;
    } else {
      console.warn('[resend] upsert contact:', msg);
    }
  }

  if (!RESEND_SEGMENT_ID) return;
  try {
    await resendFetch(
      `/contacts/${encodeURIComponent(normalized)}/segments/${RESEND_SEGMENT_ID}`,
      { method: 'POST' }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!/already|exist|409|422|restricted|unauthorized|401|403/i.test(msg)) {
      console.warn('[resend] add to segment:', msg);
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function magicLinkHtml(magicUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>Sign in · Stocks on Solana</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e0e0e0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:500px;background:#111111;border:1px solid #1e1e1e;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#FF9900 0%,#cc7700 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 28px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FF9900;margin-bottom:6px;">STOCKS ON SOLANA</div>
              <div style="font-size:10px;letter-spacing:0.12em;color:#555555;margin-bottom:24px;">REAL-TIME TOKENIZED EQUITY SCREENER</div>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#a8a8a8;">
                Click to sign in. Link expires in 15 minutes.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius:4px;background:#FF9900;">
                    <a href="${escapeHtml(magicUrl)}" style="display:inline-block;padding:12px 24px;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#0a0a0a;text-decoration:none;text-transform:uppercase;">
                      Sign in
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:11px;color:#555555;line-height:1.5;">
                If you did not request this, ignore it.
              </p>
              <p style="margin:16px 0 0;font-size:10px;color:#444444;word-break:break-all;">
                ${escapeHtml(magicUrl)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Transactional welcome HTML (no Broadcast-only placeholders). */
export function welcomeHtml(firstName?: string): string {
  const name = firstName?.trim() || 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>Welcome to Stocks on Solana</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e0e0e0;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    You're in. Track 500+ tokenized stocks on Solana in real time.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#111111;border:1px solid #1e1e1e;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#FF9900 0%,#cc7700 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 28px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;text-align:center;">
              <img src="https://stocksonsolana.com/logo-192.png" width="56" height="56" alt="" style="border-radius:10px;margin-bottom:16px;" />
              <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FF9900;margin-bottom:10px;">
                STOCKS ON SOLANA
              </div>
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                Welcome to the terminal
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#a8a8a8;">
                Hey ${escapeHtml(name)} — you're in. Real-time screener for tokenized equities on Solana: xStocks, Ondo, PreStocks, and Backpack. Prices, liquidity, and discount or premium vs the real-world stock.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;text-align:left;">
                <tr>
                  <td style="padding:12px 14px;border:1px solid #1e1e1e;border-radius:6px;background:#0d0d0d;">
                    <div style="font-size:12px;color:#e0e0e0;margin-bottom:8px;"><span style="color:#FF9900;">→</span> Live prices via Jupiter</div>
                    <div style="font-size:12px;color:#e0e0e0;margin-bottom:8px;"><span style="color:#FF9900;">→</span> Discount / premium vs NYSE &amp; NASDAQ</div>
                    <div style="font-size:12px;color:#e0e0e0;margin-bottom:8px;"><span style="color:#FF9900;">→</span> Star favourites · filter by provider</div>
                    <div style="font-size:12px;color:#e0e0e0;"><span style="color:#FF9900;">→</span> Market pulse in this inbox</div>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:4px;background:#FF9900;">
                    <a href="https://stocksonsolana.com" style="display:inline-block;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#0a0a0a;text-decoration:none;text-transform:uppercase;">
                      Open screener
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px;font-size:12px;line-height:1.6;color:#666666;">
                Follow <a href="https://x.com/StocksOnSolana" style="color:#FF9900;text-decoration:none;">@StocksOnSolana</a> for new listings and volume alerts.
              </p>
              <p style="margin:0;font-size:11px;color:#555555;line-height:1.6;">
                <a href="${SITE_URL}/privacy" style="color:#666666;">Privacy</a>
                ·
                Not financial advice.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, firstName?: string) {
  const name = firstName?.trim() || 'there';
  return sendEmail({
    to: email,
    subject: "You're on Stocks on Solana",
    html: welcomeHtml(firstName),
    text: `Hey ${name} — you're on the Stocks on Solana list.\n\nTrack 500+ tokenized stocks in real time: ${SITE_URL}\n\nFollow @StocksOnSolana for listings and volume alerts.\n\nPrivacy: ${SITE_URL}/privacy\nNot financial advice.`,
    listUnsubscribe: true,
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'product', value: 'stocks-on-solana' },
    ],
  });
}

export async function sendMagicLinkEmail(email: string, magicUrl: string) {
  return sendEmail({
    to: email,
    subject: 'Your Stocks on Solana login link',
    html: magicLinkHtml(magicUrl),
    text: `Sign in to Stocks on Solana (expires in 15 minutes):\n\n${magicUrl}\n\nIf you did not request this, ignore it.`,
    tags: [
      { name: 'category', value: 'magic-link' },
      { name: 'product', value: 'stocks-on-solana' },
    ],
  });
}

/**
 * Create + send a Resend Broadcast to a segment (full-access key + marketing plan).
 */
export async function sendWelcomeBroadcast(segmentId: string) {
  const html = welcomeHtml('{{{contact.first_name|there}}}').replace(
    /Hey there — you're in\./,
    "Hey {{{contact.first_name|there}}} — you're in."
  );
  // Prefer broadcast template with unsubscribe token
  const broadcastHtml = welcomeHtml().replace(
    `<a href="${SITE_URL}/privacy" style="color:#666666;">Privacy</a>`,
    `<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#666666;">Unsubscribe</a>
                ·
                <a href="${SITE_URL}/privacy" style="color:#666666;">Privacy</a>`
  );

  return resendFetch('/broadcasts', {
    method: 'POST',
    body: JSON.stringify({
      segment_id: segmentId,
      from: RESEND_FROM,
      subject: "You're on Stocks on Solana",
      html: broadcastHtml,
      name: 'Welcome · Stocks on Solana',
      send: true,
    }),
  });
}
