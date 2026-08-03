/**
 * stocks-scanner — Cloudflare Worker (cron)
 *
 * Scans Jupiter datapi for new tokenized stocks on Solana.
 * Tweets new tokens via @StocksOnSolana using X OAuth 1.0a.
 * If no new token in 24h, tweets biggest gainer + loser among
 * *liquid* books only (ghost pools print nonsense marks).
 */

export interface Env {
  STOCK_SCANNER: KVNamespace;
  X_CONSUMER_KEY: string;
  X_CONSUMER_SECRET: string;
  X_ACCESS_TOKEN: string;
  X_ACCESS_TOKEN_SECRET: string;
}

interface JupiterAsset {
  id: string;
  symbol: string;
  name: string;
  usdPrice?: number | string | null;
  mcap?: number | string | null;
  liquidity?: number | string | null;
  stockData?: {
    price?: number | string | null;
    mcap?: number | string | null;
  } | null;
  stats24h?: {
    priceChange?: number | string | null;
    buyVolume?: number | string | null;
    sellVolume?: number | string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

interface JupiterResponse {
  assets?: JupiterAsset[];
  total?: number;
}

interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  provider: string;
  price: number | null;
  stockPrice: number | null;
  marketCap: number | null;
  liquidity: number;
  volume24h: number;
  priceChange24h: number | null;
}

const DATAPI_BASE = 'https://datapi.jup.ag/v2/assets/stocks/24h';
const PAGE_SIZE = 50;

/** Ignore ghost books for gainer/loser rankings */
const MIN_LIQ = 5_000;
/** Token price must stay within this band of underlying stock mark */
const MAX_PRICE_RATIO = 3;
/** Absolute 24h % moves beyond this on tokenized stocks are almost always bad data */
const MAX_ABS_CHG = 40;

const PROVIDERS: Array<{ key: string; label: string }> = [
  { key: 'xstocks', label: 'xStocks' },
  { key: 'backpack', label: 'Sunrise' },
  { key: 'ondo', label: 'Ondo' },
  { key: 'prestocks', label: 'PreStocks' },
];

const KV_KNOWN_MINTS = 'known_mints';
const KV_LAST_NEW_TOKEN_TIME = 'last_new_token_time';
const KV_LAST_GAINER_LOSER = 'last_gainer_loser_tweet';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function formatPrice(value: number | null): string {
  if (value === null) return 'N/A';
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toPrecision(4)}`;
}

function formatMcap(value: number | null): string {
  if (value === null) return 'N/A';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${(value / 1e3).toFixed(0)}K`;
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function cleanName(name: string): string {
  return name
    .replace(/\s*[-–—]\s*Backpack Securities\s*$/i, '')
    .replace(/\s*\(Ondo Tokenized\)\s*$/i, '')
    .replace(/\s+xStock\s*$/i, '')
    .replace(/\s+PreStocks?\s*$/i, '')
    .trim();
}

/** Reliable enough for public gainer/loser tweets */
function isReliable(t: TokenInfo): boolean {
  if (t.price === null || t.priceChange24h === null) return false;
  if (t.liquidity < MIN_LIQ) return false;
  if (t.volume24h < 100) return false;
  if (Math.abs(t.priceChange24h) > MAX_ABS_CHG) return false;
  if (t.stockPrice != null && t.stockPrice > 0) {
    const ratio = t.price / t.stockPrice;
    if (ratio > MAX_PRICE_RATIO || ratio < 1 / MAX_PRICE_RATIO) return false;
  }
  return true;
}

async function fetchProvider(key: string, label: string): Promise<TokenInfo[]> {
  const tokens: TokenInfo[] = [];
  let offset = 0;

  while (true) {
    const url = `${DATAPI_BASE}?stocks=${key}&offset=${offset}&includeOndoStatus=false`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!res.ok) {
      console.error(`[${label}] HTTP ${res.status} at offset ${offset}`);
      break;
    }

    const data: JupiterResponse = await res.json();
    const page = data.assets ?? [];

    for (const a of page) {
      const buy = toNumber(a.stats24h?.buyVolume) ?? 0;
      const sell = toNumber(a.stats24h?.sellVolume) ?? 0;
      tokens.push({
        mint: a.id,
        symbol: a.symbol ?? '',
        name: cleanName(a.name ?? ''),
        provider: label,
        price: toNumber(a.usdPrice),
        stockPrice: toNumber(a.stockData?.price),
        // only treat on-chain mcap as meaningful when liquid
        marketCap: toNumber(a.mcap),
        liquidity: toNumber(a.liquidity) ?? 0,
        volume24h: buy + sell,
        priceChange24h: toNumber(a.stats24h?.priceChange),
      });
    }

    if (page.length < PAGE_SIZE) break;
    if (data.total !== undefined && tokens.length >= data.total) break;
    offset += PAGE_SIZE;
  }

  return tokens;
}

async function fetchAllTokens(): Promise<TokenInfo[]> {
  const all: TokenInfo[] = [];
  for (const { key, label } of PROVIDERS) {
    try {
      const tokens = await fetchProvider(key, label);
      console.log(`[${label}] fetched ${tokens.length} tokens`);
      all.push(...tokens);
    } catch (err) {
      console.error(`[${label}] fetch error:`, err);
    }
  }
  return all;
}

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function hmacSha1(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function buildOAuthHeader(method: string, url: string, env: Env): Promise<string> {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: env.X_CONSUMER_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: env.X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join('&');

  const signingKey = `${percentEncode(env.X_CONSUMER_SECRET)}&${percentEncode(env.X_ACCESS_TOKEN_SECRET)}`;
  const baseString = `${method}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signature = await hmacSha1(signingKey, baseString);
  oauthParams.oauth_signature = signature;

  return (
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(', ')
  );
}

async function postTweet(text: string, env: Env): Promise<boolean> {
  const url = 'https://api.x.com/2/tweets';
  const authHeader = await buildOAuthHeader('POST', url, env);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = (await res.json()) as { data?: { id?: string }; errors?: unknown[] };

    if (data.data?.id) {
      console.log(`[X] Tweeted: https://x.com/StocksOnSolana/status/${data.data.id}`);
      return true;
    }
    console.error('[X] Tweet failed:', JSON.stringify(data));
    return false;
  } catch (err) {
    console.error('[X] Tweet error:', err);
    return false;
  }
}

function cashTag(symbol: string): string {
  return `$${symbol.replace(/[^A-Za-z0-9.]/g, '')}`;
}

function buildNewTokenTweet(token: TokenInfo): string {
  const priceStr = token.price !== null ? ` at ${formatPrice(token.price)}` : '';
  return [
    `New tokenized stock on Solana: ${token.name} (${cashTag(token.symbol)})${priceStr}`,
    `Provider: ${token.provider}`,
    `https://stocksonsolana.com/token/${token.symbol.toLowerCase()}`,
  ].join('\n');
}

function buildGainerTweet(token: TokenInfo): string {
  const change =
    token.priceChange24h !== null ? `+${token.priceChange24h.toFixed(2)}%` : 'N/A';
  const liq = formatPrice(token.liquidity);
  return [
    `Biggest gainer today: ${token.name} (${cashTag(token.symbol)}) ${change}`,
    `${formatPrice(token.price)} | Liq ${liq}`,
    `https://stocksonsolana.com/token/${token.symbol.toLowerCase()}`,
  ].join('\n');
}

function buildLoserTweet(token: TokenInfo): string {
  const change =
    token.priceChange24h !== null ? `${token.priceChange24h.toFixed(2)}%` : 'N/A';
  const liq = formatPrice(token.liquidity);
  return [
    `Biggest loser today: ${token.name} (${cashTag(token.symbol)}) ${change}`,
    `${formatPrice(token.price)} | Liq ${liq}`,
    `https://stocksonsolana.com/token/${token.symbol.toLowerCase()}`,
  ].join('\n');
}

async function getKnownMints(kv: KVNamespace): Promise<Set<string>> {
  const raw = await kv.get(KV_KNOWN_MINTS);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function saveKnownMints(kv: KVNamespace, mints: Set<string>): Promise<void> {
  await kv.put(KV_KNOWN_MINTS, JSON.stringify([...mints]));
}

async function getTimestamp(kv: KVNamespace, key: string): Promise<Date | null> {
  const raw = await kv.get(key);
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

async function saveTimestamp(kv: KVNamespace, key: string): Promise<void> {
  await kv.put(key, new Date().toISOString());
}

async function runScan(env: Env): Promise<void> {
  console.log(`[stocks-scanner] Starting scan at ${new Date().toISOString()}`);

  const kv = env.STOCK_SCANNER;
  const [knownMints, lastNewTokenTime, lastGainerLoserTweet] = await Promise.all([
    getKnownMints(kv),
    getTimestamp(kv, KV_LAST_NEW_TOKEN_TIME),
    getTimestamp(kv, KV_LAST_GAINER_LOSER),
  ]);

  const isFirstRun = knownMints.size === 0;
  console.log(`[scanner] Known mints: ${knownMints.size} | First run: ${isFirstRun}`);

  const allTokens = await fetchAllTokens();
  console.log(`[scanner] Total tokens fetched: ${allTokens.length}`);

  if (allTokens.length === 0) {
    console.warn('[scanner] No tokens returned — aborting');
    return;
  }

  const newTokens = isFirstRun ? [] : allTokens.filter((t) => !knownMints.has(t.mint));

  if (isFirstRun) {
    console.log('[scanner] First run — bootstrapping known mints without tweeting');
  } else {
    console.log(`[scanner] New tokens: ${newTokens.length}`);
  }

  if (newTokens.length > 0) {
    for (let i = 0; i < newTokens.length; i++) {
      const token = newTokens[i];
      const tweet = buildNewTokenTweet(token);
      console.log('[scanner] New token tweet:\n', tweet);
      await postTweet(tweet, env);
      if (i < newTokens.length - 1) await new Promise((r) => setTimeout(r, 3_000));
    }
    await saveTimestamp(kv, KV_LAST_NEW_TOKEN_TIME);
  }

  const now = Date.now();
  const noNewTokenIn24h =
    newTokens.length === 0 &&
    (lastNewTokenTime === null || now - lastNewTokenTime.getTime() >= TWENTY_FOUR_HOURS_MS);

  const gainerLoserDue =
    lastGainerLoserTweet === null ||
    now - lastGainerLoserTweet.getTime() >= TWENTY_FOUR_HOURS_MS;

  console.log(
    `[scanner] Gainer/loser due: ${gainerLoserDue} | noNew24h: ${noNewTokenIn24h}`,
  );

  if (noNewTokenIn24h && gainerLoserDue && !isFirstRun) {
    const reliable = allTokens.filter(isReliable);
    console.log(
      `[scanner] Reliable tokens (liq≥$${MIN_LIQ}, sane vs stock): ${reliable.length}/${allTokens.length}`,
    );

    if (reliable.length >= 2) {
      reliable.sort((a, b) => (a.priceChange24h ?? 0) - (b.priceChange24h ?? 0));
      const loser = reliable[0];
      const gainer = reliable[reliable.length - 1];

      console.log(
        `[scanner] Gainer: ${gainer.symbol} ${gainer.priceChange24h?.toFixed(2)}% liq=${gainer.liquidity.toFixed(0)}`,
      );
      console.log(
        `[scanner] Loser:  ${loser.symbol} ${loser.priceChange24h?.toFixed(2)}% liq=${loser.liquidity.toFixed(0)}`,
      );

      await postTweet(buildGainerTweet(gainer), env);
      await new Promise((r) => setTimeout(r, 3_000));
      await postTweet(buildLoserTweet(loser), env);
      await saveTimestamp(kv, KV_LAST_GAINER_LOSER);
    } else {
      console.warn('[scanner] Not enough reliable tokens for gainer/loser');
    }
  }

  const updatedMints = new Set([...knownMints, ...allTokens.map((t) => t.mint)]);
  await saveKnownMints(kv, updatedMints);
  console.log(`[scanner] Saved ${updatedMints.size} known mints`);
  console.log(`[scanner] Scan complete at ${new Date().toISOString()}`);
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(runScan(env));
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.searchParams.get('run') === '1') {
      ctx.waitUntil(runScan(env));
      return new Response('Scan triggered — check logs via `wrangler tail`\n', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return new Response('stocks-scanner worker running\n', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
} satisfies ExportedHandler<Env>;
