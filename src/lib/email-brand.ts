/**
 * Shared brand tokens + shell for Stocks on Solana email HTML.
 * Gradient: gold → amber → violet (Gray identity).
 */

export const BRAND = {
  bg: '#0a0a0a',
  card: '#111111',
  border: '#1e1e1e',
  text: '#e8e8e8',
  muted: '#a8a8a8',
  dim: '#666666',
  gold: '#F8F700',
  amber: '#FBAE17',
  violet: '#7F47DD',
  cta: '#FBAE17',
  green: '#00e676',
  red: '#ff4d4d',
  gradient: 'linear-gradient(90deg,#F8F700 0%,#FBAE17 45%,#7F47DD 100%)',
  logo: 'https://stocksonsolana.com/logo-mark.png',
  site: 'https://stocksonsolana.com',
  x: 'https://x.com/StocksOnSolana',
  from: 'Stocks on Solana <noreply@stocksonsolana.com>',
} as const;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const MONO =
  "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace";

type ShellOpts = {
  preheader?: string;
  title: string;
  bodyHtml: string;
  footerExtra?: string;
};

/** Dark card shell with brand gradient bar + logo. */
export function emailShell(opts: ShellOpts): string {
  const pre = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};color:${BRAND.text};">
  ${pre}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="height:6px;background:${BRAND.gradient};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 28px;font-family:${FONT};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <img src="${BRAND.logo}" width="52" height="52" alt="Stocks on Solana" style="display:block;margin:0 auto 12px;border:0;" />
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;background:${BRAND.gradient};-webkit-background-clip:text;background-clip:text;color:${BRAND.amber};">
                      STOCKS ON SOLANA
                    </div>
                  </td>
                </tr>
              </table>
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;font-family:${FONT};text-align:center;">
              <p style="margin:0 0 10px;font-size:12px;color:${BRAND.dim};line-height:1.6;">
                <a href="${BRAND.x}" style="color:${BRAND.amber};text-decoration:none;">@StocksOnSolana</a>
                ·
                <a href="${BRAND.site}" style="color:${BRAND.dim};text-decoration:none;">stocksonsolana.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#555;line-height:1.6;">
                ${opts.footerExtra || ''}
                Design by <a href="https://graysunderland.com" style="color:#666;text-decoration:none;">Gray</a>
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

export function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px;">
  <tr>
    <td style="border-radius:8px;background:${BRAND.gradient};">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:0.06em;color:#0a0a0a;text-decoration:none;text-transform:uppercase;font-family:${FONT};">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`;
}

export function magicLinkHtml(magicUrl: string): string {
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#fff;text-align:center;letter-spacing:-0.02em;">
      Sign in
    </h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:${BRAND.muted};text-align:center;">
      Click to open the screener. This link expires in 15 minutes.
    </p>
    ${ctaButton(magicUrl, 'Sign in')}
    <p style="margin:0 0 8px;font-size:11px;color:#555;text-align:center;">If you did not request this, ignore it.</p>
    <p style="margin:0;font-size:10px;color:#444;word-break:break-all;text-align:center;font-family:${MONO};">
      ${escapeHtml(magicUrl)}
    </p>`;
  return emailShell({
    title: 'Sign in · Stocks on Solana',
    preheader: 'Your login link — expires in 15 minutes.',
    bodyHtml: body,
  });
}

export function welcomeHtml(firstName?: string): string {
  const name = firstName?.trim() || 'there';
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#fff;text-align:center;letter-spacing:-0.02em;">
      Welcome to the terminal
    </h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:${BRAND.muted};text-align:center;">
      Hey ${escapeHtml(name)} — you're in. Real-time screener for tokenized equities on Solana:
      xStocks, Sunrise (Backpack), Ondo, PreStocks, and more. Live prices, liquidity, and mark vs the real-world stock.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:14px 16px;border:1px solid ${BRAND.border};border-radius:8px;background:#0d0d0d;text-align:left;">
          <div style="font-size:13px;color:${BRAND.text};margin-bottom:8px;"><span style="color:${BRAND.amber};">→</span> Live prices via Jupiter</div>
          <div style="font-size:13px;color:${BRAND.text};margin-bottom:8px;"><span style="color:${BRAND.amber};">→</span> Discount / premium vs NYSE &amp; NASDAQ</div>
          <div style="font-size:13px;color:${BRAND.text};margin-bottom:8px;"><span style="color:${BRAND.amber};">→</span> Filter xStocks · Sunrise · Ondo</div>
          <div style="font-size:13px;color:${BRAND.text};"><span style="color:${BRAND.amber};">→</span> Market pulse in this inbox</div>
        </td>
      </tr>
    </table>
    ${ctaButton(BRAND.site, 'Open screener')}`;
  return emailShell({
    title: 'Welcome to Stocks on Solana',
    preheader: "You're in. Track 600+ tokenized stocks on Solana in real time.",
    bodyHtml: body,
    footerExtra: `<a href="${BRAND.site}/privacy" style="color:#666;">Privacy</a> · `,
  });
}
