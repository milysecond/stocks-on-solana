#!/usr/bin/env node
/**
 * Send welcome email to every subscribed Resend contact.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node scripts/send-welcome-blast.mjs
 *   RESEND_API_KEY=re_xxx node scripts/send-welcome-blast.mjs --dry-run
 *   RESEND_API_KEY=re_xxx node scripts/send-welcome-blast.mjs --csv emails.csv
 *   RESEND_API_KEY=re_xxx RESEND_SEGMENT_ID=uuid node scripts/send-welcome-blast.mjs --broadcast
 *
 * Full-access key required for listing contacts / broadcasts.
 * Send-only key works with --csv (batch transactional send).
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const API = 'https://api.resend.com';
const FROM =
  process.env.RESEND_FROM || 'Stocks on Solana <noreply@stocksonsolana.com>';
const SITE = process.env.NEXT_PUBLIC_URL || 'https://stocksonsolana.com';
const KEY = process.env.RESEND_API_KEY;
const SEGMENT = process.env.RESEND_SEGMENT_ID || '';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const useBroadcast = args.includes('--broadcast');
const csvIdx = args.indexOf('--csv');
const csvPath = csvIdx >= 0 ? args[csvIdx + 1] : null;

if (!KEY) {
  console.error('RESEND_API_KEY required');
  process.exit(1);
}

async function resend(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json.message || json.name || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function welcomeHtml(name = 'there', { broadcast = false } = {}) {
  const unsub = broadcast
    ? `<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#666666;">Unsubscribe</a>
                ·
                <a href="${SITE}/privacy" style="color:#666666;">Privacy</a>`
    : `<a href="${SITE}/privacy" style="color:#666666;">Privacy</a>`;

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
              <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FF9900;margin-bottom:10px;">STOCKS ON SOLANA</div>
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Welcome to the terminal</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#a8a8a8;">
                Hey ${escapeHtml(name)} — you're in. Real-time screener for tokenized equities on Solana: xStocks, Ondo, PreStocks, and Backpack.
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
                    <a href="https://stocksonsolana.com" style="display:inline-block;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#0a0a0a;text-decoration:none;text-transform:uppercase;">Open screener</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px;font-size:12px;line-height:1.6;color:#666666;">
                Follow <a href="https://x.com/StocksOnSolana" style="color:#FF9900;text-decoration:none;">@StocksOnSolana</a> for new listings and volume alerts.
              </p>
              <p style="margin:0;font-size:11px;color:#555555;line-height:1.6;">
                ${unsub}
                · Not financial advice.
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

function parseCsv(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const emails = [];
  for (const line of lines) {
    const cell = line.split(',')[0].trim().replace(/^"|"$/g, '');
    if (cell.includes('@') && !cell.toLowerCase().startsWith('email')) {
      emails.push({ email: cell.toLowerCase() });
    }
  }
  return emails;
}

async function listContacts() {
  const out = [];
  let after;
  for (let i = 0; i < 100; i++) {
    const qs = new URLSearchParams({ limit: '100' });
    if (after) qs.set('after', after);
    const res = await resend(`/contacts?${qs}`);
    const data = res.data || [];
    out.push(...data);
    if (!res.has_more || !data.length) break;
    after = data[data.length - 1]?.id;
    if (!after) break;
  }
  return out;
}

async function sendBatch(recipients) {
  const chunks = [];
  for (let i = 0; i < recipients.length; i += 100) {
    chunks.push(recipients.slice(i, i + 100));
  }
  let sent = 0;
  for (const chunk of chunks) {
    const payload = chunk.map((c) => {
      const name = c.first_name || 'there';
      return {
        from: FROM,
        to: [c.email],
        subject: "You're on Stocks on Solana",
        html: welcomeHtml(name),
        text: `Hey ${name} — you're on Stocks on Solana.\n\nOpen the screener: ${SITE}\n\nPrivacy: ${SITE}/privacy`,
        tags: [
          { name: 'category', value: 'welcome' },
          { name: 'product', value: 'stocks-on-solana' },
        ],
      };
    });
    if (dryRun) {
      console.log(`[dry-run] would batch-send ${payload.length}`);
      sent += payload.length;
      continue;
    }
    const res = await resend('/emails/batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const n = Array.isArray(res.data) ? res.data.length : payload.length;
    sent += n;
    console.log(`batch ok +${n} (total ${sent})`);
  }
  return sent;
}

async function main() {
  console.log({ dryRun, useBroadcast, from: FROM, hasSegment: Boolean(SEGMENT) });

  if (useBroadcast) {
    if (!SEGMENT) {
      console.error('RESEND_SEGMENT_ID required for --broadcast');
      process.exit(1);
    }
    if (dryRun) {
      console.log('[dry-run] would create+send broadcast to segment', SEGMENT);
      return;
    }
    const res = await resend('/broadcasts', {
      method: 'POST',
      body: JSON.stringify({
        segment_id: SEGMENT,
        from: FROM,
        subject: "You're on Stocks on Solana",
        html: welcomeHtml('{{{contact.first_name|there}}}', { broadcast: true }),
        name: `Welcome blast ${new Date().toISOString().slice(0, 10)}`,
        send: true,
      }),
    });
    console.log('broadcast sent', res);
    return;
  }

  let contacts;
  if (csvPath) {
    const p = resolve(csvPath);
    if (!existsSync(p)) {
      console.error('CSV not found:', p);
      process.exit(1);
    }
    contacts = parseCsv(p);
    console.log(`loaded ${contacts.length} from CSV`);
  } else {
    try {
      contacts = await listContacts();
      console.log(`listed ${contacts.length} contacts from Resend`);
    } catch (e) {
      console.error('Failed to list contacts:', e.message);
      console.error(
        'Your key may be send-only. Create a Full access key at https://resend.com/api-keys'
      );
      console.error('Or pass --csv path/to/emails.csv');
      process.exit(1);
    }
  }

  const recipients = contacts
    .filter((c) => c.email && !c.unsubscribed)
    .map((c) => ({
      email: String(c.email).toLowerCase(),
      first_name: c.first_name || c.firstName || null,
    }));

  // de-dupe
  const seen = new Set();
  const unique = recipients.filter((r) => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });

  console.log(`sending welcome to ${unique.length} recipients`);
  if (!unique.length) {
    console.log('nothing to send');
    return;
  }

  const n = await sendBatch(unique);
  console.log(`done. sent=${n}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
