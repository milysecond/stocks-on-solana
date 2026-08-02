/**
 * Resend helpers for Stocks on Solana.
 * Requires RESEND_API_KEY. From address must be verified on stocksonsolana.com.
 *
 * Full-access key: contacts, segments, broadcasts.
 * Send-only key: transactional mail (magic links, single welcome sends).
 */

import { magicLinkHtml as brandMagicHtml, welcomeHtml as brandWelcomeHtml } from './email-brand';

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

/** Published Resend template IDs (optional env overrides). */
const TPL_MAGIC =
  process.env.RESEND_TPL_MAGIC_LINK || '91193563-db1a-43bd-8ad9-9d94141696d6';
const TPL_WELCOME =
  process.env.RESEND_TPL_WELCOME || '1139c53d-1341-4410-8384-a71c51a0a561';

export function magicLinkHtml(magicUrl: string): string {
  return brandMagicHtml(magicUrl);
}

export function welcomeHtml(firstName?: string): string {
  return brandWelcomeHtml(firstName);
}

export async function sendWelcomeEmail(email: string, firstName?: string) {
  const name = firstName?.trim() || 'there';
  if (TPL_WELCOME) {
    return resendFetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        template: {
          id: TPL_WELCOME,
          variables: { CONTACT_NAME: name },
        },
        headers: {
          'List-Unsubscribe': `<${SITE_URL}/privacy>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: [
          { name: 'category', value: 'welcome' },
          { name: 'product', value: 'stocks-on-solana' },
        ],
      }),
    });
  }
  return sendEmail({
    to: email,
    subject: "You're on Stocks on Solana",
    html: welcomeHtml(firstName),
    text: `Hey ${name} — you're on the Stocks on Solana list.\n\nTrack 600+ tokenized stocks in real time: ${SITE_URL}\n\nFollow @StocksOnSolana for listings and volume alerts.\n\nPrivacy: ${SITE_URL}/privacy\nNot financial advice.`,
    listUnsubscribe: true,
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'product', value: 'stocks-on-solana' },
    ],
  });
}

export async function sendMagicLinkEmail(email: string, magicUrl: string) {
  if (TPL_MAGIC) {
    return resendFetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        template: {
          id: TPL_MAGIC,
          variables: { MAGIC_URL: magicUrl },
        },
        tags: [
          { name: 'category', value: 'magic-link' },
          { name: 'product', value: 'stocks-on-solana' },
        ],
      }),
    });
  }
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

/** Create + send a Resend Broadcast to a segment (full-access key). */
export async function sendWelcomeBroadcast(segmentId: string) {
  const broadcastHtml = welcomeHtml().replace(
    `<a href="${SITE_URL}/privacy" style="color:#666;">Privacy</a>`,
    `<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#666;">Unsubscribe</a>
                ·
                <a href="${SITE_URL}/privacy" style="color:#666;">Privacy</a>`
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
