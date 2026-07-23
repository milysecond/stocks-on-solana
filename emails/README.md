# Stocks on Solana · Email / Newsletter

Terminal-styled HTML for SendGrid. Brand matches the screener: black `#0a0a0a`, amber `#FF9900`, mono type.

## Files

| File | Use |
|------|-----|
| `SENDGRID_BRAND.json` | From address, list ID, colors, send checklist |
| `newsletter.html` | Blank weekly template (sections marked `<!-- EDIT -->`) |
| `welcome.html` | Welcome / onboarding after first sign-in |
| `issues/001-market-pulse.html` | Issue #001 ready to paste into SendGrid |

## Send Issue #001

1. Open [SendGrid](https://app.sendgrid.com) → **Marketing** → **Single Sends** → **Create Single Send**
2. Design → **Code** (or HTML editor) → paste `issues/001-market-pulse.html`
3. **Recipients**: list `Stocks on Solana` (`f776877f-7764-467e-b6f7-b36270d19f0b`)
4. **From**: `Stocks on Solana <noreply@stocksonsolana.com>`
5. **Subject**: `Backpack leads volume · TSLAx -9.7% · 590 tickers live`
6. Attach an **unsubscribe group** (ASM) so `{{unsubscribe}}` resolves
7. Preview on mobile + desktop → schedule or send

## Next issues

1. Copy `newsletter.html` → `issues/00N-slug.html`
2. Refresh numbers from:
   - `https://stocksonsolana.com/api/prices`
   - `https://stocksonsolana.com/api/token-list`
3. Prefer **high volume** names for tables; thin books produce misleading % moves
4. Keep preheader under ~90 characters

## Contacts

Contacts land on the SendGrid list when users request a magic link (`src/app/api/auth/request/route.ts`). Domain auth should already cover `noreply@stocksonsolana.com`.

## Local preview

Open any HTML file in a browser, or:

```bash
open emails/issues/001-market-pulse.html
```

## Voice

- Numbers first, short sentences
- No hashtags, no emoji
- Always: not financial advice + liquidity caveat
- Link back to the live screener, not screenshots of stale prices
