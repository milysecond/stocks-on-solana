# Stocks on Solana

Real-time screener for tokenized stocks on Solana.

[stocksonsolana.com](https://stocksonsolana.com) · [@stocksonsolana](https://x.com/stocksonsolana)

## What it does

The live board is whatever Jupiter's stocks feed returns, plus the verified xStocks UK list in `src/lib/xstocks-uk.ts`. On 16 Nov 2026 that feed was **2,114** tokenized stocks: **1,519 xStocks** (100 of them LSE listings), Ondo, PreStocks, Sunrise, and a handful of other issuers.

For each name you get the on-chain USD price, 24h change, liquidity, and the discount or premium versus the underlying quote. LSE names show that quote in pounds. The percent is still on-chain USD versus the USD equivalent of the London print, so it is not a GBP-versus-USD gap. The status bar clocks **NYSE** and **LSE** separately.

Issuers on the board: **xStocks**, **Ondo**, **PreStocks**, **Sunrise** (Backpack Securities), and anything else Jupiter tags (Shift, Tessera, Superstate).

## Features

- Live screener from Jupiter's stocks datapi, refreshed about every 30 seconds
- 100 LSE-listed xStocks (GBP reference, London session, Solana mints)
- Discount / premium versus the underlying quote
- Token icons (local, issuer CDN, then a letter fallback)
- `/token/[ticker]` pages with a CoinGecko chart (GeckoTerminal pool, then TradingView fallback), mint, and JSON-LD. Short `/TICKER` URLs 301 there
- NYSE and LSE regular-session clocks
- SOL price in the status bar
- Starred names in localStorage
- Magic-link sign-in (HMAC session cookie, 30 days) and Resend mail
- `/exchanges`, `/partners`, `/brand`, `/press`, `/privacy`, `/terms`
- Sitemap at `/sitemap.xml` and `robots.txt`
- Google Analytics `G-79CB6BK271`

## Stack

- Next.js 16 and React 19, TypeScript
- Tailwind CSS 4 plus the app's own CSS
- Space Grotesk for UI, JetBrains Mono for figures
- Jupiter datapi for stock marks. Jupiter Price API v3 for the SOL price
- Resend (`noreply@stocksonsolana.com`)
- Web Crypto for magic links and sessions
- Cloudflare Pages project `stocks-on-solana`

## Production

- Canonical host: https://stocksonsolana.com
- `www.stocksonsolana.com` 301s to the apex
- `stocks-on-solana.pages.dev` is the same Pages project and sends `noindex`
- `stocks-on-solana.vercel.app` is a dead deployment. This app is not hosted on Vercel

GitHub Actions workflow "Deploy to Cloudflare Pages" runs on push to `main`, but it has been failing on a Cloudflare billing lock. Production updates are manual `wrangler pages deploy` uploads of this same project. Do not treat a green Action as the source of what is live.

## Development

```bash
npm install
npm run dev
```

There is no `.env.example`. Create `.env.local` if you need auth or mail:

```
RESEND_API_KEY=
RESEND_FROM=Stocks on Solana <noreply@stocksonsolana.com>
RESEND_SEGMENT_ID=
RESEND_TPL_MAGIC_LINK=
RESEND_TPL_WELCOME=
JWT_SECRET=
NEXT_PUBLIC_URL=https://stocksonsolana.com
```

The screener itself reads public Jupiter endpoints and does not need those keys. `JWT_SECRET` should be set in production. The Jupiter referral id is hardcoded in `src/lib/tokens.ts`.

## Deploy

Manual upload to the Cloudflare Pages project `stocks-on-solana` (same steps as `.github/workflows/deploy.yml`):

```bash
npm ci
npm run build
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name=stocks-on-solana --branch=main
```

`npx @cloudflare/next-on-pages` runs the Vercel build adapter. That directory name is the adapter output. The site is still uploaded to Cloudflare Pages, not deployed to Vercel.

## Architecture

- API routes and token pages use the Edge runtime. Sessions are HMAC-SHA256 JWTs in an HttpOnly cookie (30 days). Magic links expire in 15 minutes. No database
- Stars stay in localStorage
- UK xStocks are merged into the Jupiter crawl from `src/lib/xstocks-uk.ts`. Issuer quotes for those names are USD equivalents of the LSE print. Pounds shown in the UI are that USD figure divided by a GBPUSD rate from Frankfurter
- `www` redirects to the apex in `src/middleware.ts`. `*.pages.dev` is `noindex`

## License

MIT
