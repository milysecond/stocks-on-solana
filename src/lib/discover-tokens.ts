import { ALL_TOKENS, StockToken, TokenProvider } from './tokens';

const DATAPI_BASE = 'https://datapi.jup.ag/v2/assets/stocks/24h';

export interface ScreenerAsset {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  usdPrice?: number;
  liquidity?: number;
  mcap?: number;
  tags?: string[];
  /** ISO mint / listing time from Jupiter */
  createdAt?: string;
  firstPool?: { id?: string; createdAt?: string };
  stockData?: { id: string; price: number; mcap: number; updatedAt: string };
  stats24h?: {
    priceChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    holderChange?: number;
  };
}

export type PriceEntry = {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  stockPrice: number | null;
  mcap: number | null;
  underlyingMcap: number | null;
};

export type ScreenerBundle = {
  tokens: StockToken[];
  prices: Record<string, PriceEntry>;
  /** mint → unix seconds (from Jupiter createdAt / firstPool) */
  ages: Record<string, number>;
  updatedAt: number;
};

const PROVIDER_LABEL: Record<string, TokenProvider> = {
  xstocks: 'xStocks',
  backpack: 'Sunrise',
  ondo: 'Ondo',
  prestocks: 'PreStocks',
  shift: 'Shift',
  tessera: 'Tessera',
  superstate: 'Superstate',
};

const PAGE_SIZE = 50;
/** Shared edge-isolate cache — one Jupiter crawl for token-list + prices */
const CACHE_TTL_MS = 25_000;

let memCache: { at: number; assets: ScreenerAsset[] } | null = null;
let inflight: Promise<ScreenerAsset[]> | null = null;

/** Prefer token createdAt, else first pool time → unix seconds */
function assetAgeUnix(asset: ScreenerAsset): number | null {
  const raw = asset.createdAt || asset.firstPool?.createdAt;
  if (!raw) return null;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / 1000);
}

function assetsToAges(assets: ScreenerAsset[]): Record<string, number> {
  const ages: Record<string, number> = {};
  for (const a of assets) {
    const ts = assetAgeUnix(a);
    if (ts != null) ages[a.id] = ts;
  }
  return ages;
}

function cleanName(name: string): string {
  return name
    .replace(/\s*[-–—]\s*Backpack Securities\s*$/i, '')
    .replace(/\s*\(Ondo Tokenized\)\s*$/i, '')
    .replace(/\s+xStock\s*$/i, '')
    .replace(/\s+PreStocks?\s*$/i, '')
    .replace(/\s*\(Ondo Tokenized Stock\)\s*$/i, '')
    .trim();
}

function providerFromAsset(asset: ScreenerAsset): TokenProvider {
  const sid = (asset.stockData?.id || '').toLowerCase();
  if (sid && PROVIDER_LABEL[sid]) return PROVIDER_LABEL[sid];
  const tags = (asset.tags || []).map((t) => t.toLowerCase());
  for (const [key, label] of Object.entries(PROVIDER_LABEL)) {
    if (tags.includes(key)) return label;
  }
  if (tags.includes('backpack')) return 'Sunrise';
  return 'Other';
}

async function fetchPage(offset: number): Promise<{ assets: ScreenerAsset[]; total: number }> {
  const url = `${DATAPI_BASE}?offset=${offset}&includeOndoStatus=false`;
  // Prefer short CDN cache at fetch layer when platform supports it
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 20 },
  });
  if (!res.ok) throw new Error(`datapi returned ${res.status}`);
  return res.json() as Promise<{ assets: ScreenerAsset[]; total: number }>;
}

/**
 * Fetch ALL tokenized stocks Jupiter indexes.
 * Single-flight + 25s memory cache so concurrent API routes share one crawl.
 */
async function fetchAllScreenerAssets(): Promise<ScreenerAsset[]> {
  const now = Date.now();
  if (memCache && now - memCache.at < CACHE_TTL_MS) {
    return memCache.assets;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const first = await fetchPage(0);
      const assets = [...(first.assets ?? [])];
      const total = first.total ?? assets.length;

      if (total > PAGE_SIZE) {
        const pageCount = Math.ceil(total / PAGE_SIZE);
        // Cap concurrency bursts — still parallel but chunked
        const offsets = Array.from({ length: pageCount - 1 }, (_, i) => (i + 1) * PAGE_SIZE);
        const CHUNK = 6;
        for (let i = 0; i < offsets.length; i += CHUNK) {
          const slice = offsets.slice(i, i + CHUNK);
          const pages = await Promise.all(slice.map((o) => fetchPage(o)));
          for (const page of pages) assets.push(...(page.assets ?? []));
        }
      }

      const seen = new Set<string>();
      const unique: ScreenerAsset[] = [];
      for (const a of assets) {
        if (!a.id || seen.has(a.id)) continue;
        seen.add(a.id);
        unique.push(a);
      }

      memCache = { at: Date.now(), assets: unique };
      return unique;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** @deprecated prefer fetchAllScreenerAssets */
async function fetchScreener(key: string): Promise<ScreenerAsset[]> {
  const fetchP = async (offset: number) => {
    const url = `${DATAPI_BASE}?stocks=${key}&offset=${offset}&includeOndoStatus=false`;
    const res = await fetch(url, { next: { revalidate: 20 } } as RequestInit);
    if (!res.ok) throw new Error(`datapi ${key} returned ${res.status}`);
    return res.json() as Promise<{ assets: ScreenerAsset[]; total: number }>;
  };
  const first = await fetchP(0);
  const assets = [...(first.assets ?? [])];
  const total = first.total ?? 0;
  if (total > PAGE_SIZE) {
    const pageCount = Math.ceil(total / PAGE_SIZE);
    const pages = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) => fetchP((i + 1) * PAGE_SIZE)),
    );
    for (const page of pages) assets.push(...(page.assets ?? []));
  }
  return assets;
}

function assetsToTokens(assets: ScreenerAsset[]): StockToken[] {
  const knownMints = new Map<string, StockToken>(ALL_TOKENS.map((t) => [t.mint, t]));
  return assets.map((asset): StockToken => {
    const known = knownMints.get(asset.id);
    return {
      mint: asset.id,
      symbol: asset.symbol,
      name: known?.name ?? cleanName(asset.name),
      provider: providerFromAsset(asset),
      sector: known?.sector ?? 'Other',
      company: known?.company,
    };
  });
}

function assetsToPrices(assets: ScreenerAsset[]): Record<string, PriceEntry> {
  const priceMap: Record<string, PriceEntry> = {};
  for (const asset of assets) {
    const vol24h = asset.stats24h
      ? (asset.stats24h.buyVolume ?? 0) + (asset.stats24h.sellVolume ?? 0)
      : null;
    priceMap[asset.id] = {
      price: asset.usdPrice ?? null,
      change24h: asset.stats24h?.priceChange ?? null,
      volume24h: vol24h,
      liquidity: asset.liquidity ?? null,
      stockPrice: asset.stockData?.price ?? null,
      mcap: asset.mcap ?? null,
      underlyingMcap: asset.stockData?.mcap ?? null,
    };
  }
  return priceMap;
}

export async function discoverTokens(): Promise<StockToken[]> {
  try {
    const assets = await fetchAllScreenerAssets();
    const discovered = assetsToTokens(assets);
    return discovered.length > 0 ? discovered : ALL_TOKENS;
  } catch (e) {
    console.error('[discover-tokens] Falling back to static list:', e);
    return ALL_TOKENS;
  }
}

export async function fetchScreenerPrices(): Promise<Record<string, PriceEntry>> {
  try {
    const all = await fetchAllScreenerAssets();
    return assetsToPrices(all);
  } catch (e) {
    console.error('[discover-tokens] fetchScreenerPrices failed:', e);
    return {};
  }
}

/** One crawl → tokens + prices (preferred bootstrap) */
export async function fetchScreenerBundle(): Promise<ScreenerBundle> {
  try {
    const assets = await fetchAllScreenerAssets();
    const tokens = assetsToTokens(assets);
    return {
      tokens: tokens.length > 0 ? tokens : ALL_TOKENS,
      prices: assetsToPrices(assets),
      ages: assetsToAges(assets),
      updatedAt: Date.now(),
    };
  } catch (e) {
    console.error('[discover-tokens] bundle failed:', e);
    return { tokens: ALL_TOKENS, prices: {}, ages: {}, updatedAt: Date.now() };
  }
}

/** Ages only — same Jupiter crawl/cache, no RPC history walks */
export async function fetchTokenAges(): Promise<Record<string, number>> {
  try {
    const assets = await fetchAllScreenerAssets();
    return assetsToAges(assets);
  } catch (e) {
    console.error('[discover-tokens] ages failed:', e);
    return {};
  }
}

export { fetchScreener, fetchAllScreenerAssets, PROVIDER_LABEL, cleanName };
