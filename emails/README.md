# Stocks on Solana · Email / Newsletter (Resend)

Terminal-styled HTML for [Resend](https://resend.com). Brand matches the screener: black `#0a0a0a`, amber `#FF9900`, mono type.

## Files

| File | Use |
|------|-----|
| `RESEND_BRAND.json` | From address, colors, Resend checklist |
| `newsletter.html` | Blank weekly template (sections marked `<!-- EDIT -->`) |
| `welcome.html` | Welcome / onboarding |
| `issues/001-market-pulse.html` | Issue #001 ready to paste into Resend Broadcasts |

## Env

```
RESEND_API_KEY=
RESEND_FROM=Stocks on Solana <noreply@stocksonsolana.com>
RESEND_SEGMENT_ID=          # optional audience segment
NEXT_PUBLIC_URL=https://stocksonsolana.com
JWT_SECRET=
```

Domain `stocksonsolana.com` must be verified in Resend (DNS). From address: `noreply@stocksonsolana.com`.

## Send Issue #001

1. Open [Resend](https://resend.com) → **Broadcasts** → **Create**
2. Paste HTML from `issues/001-market-pulse.html` (keep `{{{RESEND_UNSUBSCRIBE_URL}}}`)
3. **From**: `Stocks on Solana <noreply@stocksonsolana.com>`
4. **Subject**: `Backpack leads volume · TSLAx -9.7% · 590 tickers live`
5. Audience: segment (set `RESEND_SEGMENT_ID`) or all contacts
6. Preview → schedule or send

## Transactional (magic link)

`src/app/api/auth/request/route.ts` sends sign-in links via Resend and best-effort upserts the contact for broadcasts.

Send-only API keys can deliver mail but cannot manage contacts/segments; use a full-access key for list sync, or manage the audience in the Resend dashboard.

## Next issues

1. Copy `newsletter.html` → `issues/00N-slug.html`
2. Refresh numbers from `/api/prices` and `/api/token-list`
3. Prefer high-volume names; thin books produce misleading % moves

## Local preview

```bash
open emails/issues/001-market-pulse.html
```

## Voice

- Numbers first, short sentences
- No hashtags, no emoji
- Always: not financial advice + liquidity caveat
