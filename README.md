# Stocks on Solana

**Real-time tokenized equity screener on Solana.**

🔗 [stocksonsolana.com](https://stocksonsolana.com) · 🐦 [@stocksonsolana](https://x.com/stocksonsolana)

---

## What it does

Track 252+ tokenized stocks trading on Solana — real-time prices, 24h changes, on-chain liquidity, and discount/premium vs real-world price.

Providers: **xStocks**, **Ondo Finance**, **PreStocks**

---

## Features

- **252+ tokenized stocks** across 3 providers
- **Real-time prices** via Jupiter Price API v3
- **Discount/Mark column** — on-chain price vs real NYSE/NASDAQ price
- **Token icons** — xStocks CDN, Ondo CDN, PreStocks CDN with SVG fallback
- **Token detail modal** — full stats, mint address, buy link
- **NYSE market status** — OPEN/CLOSED with countdown (ET timezone)
- **SOL price** in status bar
- **Star stocks** — bookmark favourites (localStorage)
- **Sign in** — magic link auth via email (JWT cookie, 30 days)
- **Email capture** → SendGrid "Stocks on Solana" list
- **Newsletter** → HTML templates in `emails/` (welcome + weekly market pulse)
- **Virtualised table** — `@tanstack/react-virtual`, renders only visible rows (TBT ~10ms)
- **252 `/token/[ticker]` static pages** — SEO, OG tags, JSON-LD schema
- **Sitemap** at `/sitemap.xml`, `robots.txt`
- **OG image** — JetBrains Mono, real logo, live ticker table
- **Privacy Policy** at `/privacy`, **Terms of Service** at `/terms`
- **Google Analytics** — `G-79CB6BK271`
- **Cloudflare Pages** deployment

---

## Stack

- **Next.js 15** + TypeScript + Tailwind-free (pure CSS-in-JS)
- **JetBrains Mono** throughout
- **Jupiter Price API v3** for prices
- **SendGrid** for email (domain verified: `noreply@stocksonsolana.com`)
- **jose** for JWT sessions
- **Cloudflare Pages** for hosting

---

## Development

```bash
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

### Env vars

```
SENDGRID_API_KEY=
SENDGRID_FROM=noreply@stocksonsolana.com
JWT_SECRET=
NEXT_PUBLIC_JUPITER_REF_ID=yfgv2ibxy07v
```

### Production build (CF Pages)

```bash
npx vercel build --yes
npx @cloudflare/next-on-pages --skip-build
CLOUDFLARE_API_KEY=... CLOUDFLARE_EMAIL=... npx wrangler pages deploy .vercel/output/static --project-name=stocks-on-solana
```

---

## Architecture

- All API routes run on **Node.js runtime** (not edge) for `jose` compatibility
- Magic link tokens: HMAC-SHA256 signed, 15-min expiry, no database
- Sessions: JWT in HttpOnly cookie, 30-day expiry
- Stars: localStorage (client-side, no backend)
- Token icons: provider CDN fast-path → Helius DAS fallback → SVG fallback

---

## License

MIT
