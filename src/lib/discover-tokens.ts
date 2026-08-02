import { ALL_TOKENS, StockToken, TokenProvider } from './tokens';

const DATAPI_BASE = 'https://datapi.jup.ag/v2/assets/stocks/24h';

export interface ScreenerAsset {
  id: string;           // mint address
  name: string;
  symbol: string;
  icon?: string;
  usdPrice?: number;
  liquidity?: number;
  mcap?: number;        // on-chain tokenized market cap
  tags?: string[];
  stockData?: { id: string; price: number; mcap: number; updatedAt: string };
  stats24h?: {
    priceChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    holderChange?: number;
  };
}

/** Jupiter stockData.id → UI provider label */
const PROVIDER_LABEL: Record<string, TokenProvider> = {
  xstocks: 'xStocks',
  // Backpack Securities issued via Sunrise protocol
  backpack: 'Sunrise',
  ondo: 'Ondo',
  prestocks: 'PreStocks',
  shift: 'Shift',
  tessera: 'Tessera',
  superstate: 'Superstate',
};

const PAGE_SIZE = 50;

/** Strip issuer suffixes from display names */
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
  const tags = (asset.tags || []).map(t => t.toLowerCase());
  for (const [key, label] of Object.entries(PROVIDER_LABEL)) {
    if (tags.includes(key)) return label;
  }
  // backpack tag sometimes missing stockData id path
  if (tags.includes('backpack')) return 'Sunrise';
  return 'Other';
}

/**
 * Fetch ALL tokenized stocks Jupiter indexes (no stocks= filter).
 * Covers xStocks, Sunrise/Backpack, Ondo, PreStocks, Shift, Tessera, Superstate.
 */
async function fetchAllScreenerAssets(): Promise<ScreenerAsset[]> {
  const fetchPage = async (offset: number) => {
    const url = `${DATAPI_BASE}?offset=${offset}&includeOndoStatus=false`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`datapi returned ${res.status}`);
    return res.json() as Promise<{ assets: ScreenerAsset[]; total: number }>;
  };

  const first = await fetchPage(0);
  const assets = [...(first.assets ?? [])];
  const total = first.total ?? 0;

  if (total > PAGE_SIZE) {
    const pageCount = Math.ceil(total / PAGE_SIZE);
    const pages = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) => fetchPage((i + 1) * PAGE_SIZE))
    );
    for (const page of pages) assets.push(...(page.assets ?? []));
  }

  // de-dupe by mint
  const seen = new Set<string>();
  const unique: ScreenerAsset[] = [];
  for (const a of assets) {
    if (!a.id || seen.has(a.id)) continue;
    seen.add(a.id);
    unique.push(a);
  }
  return unique;
}

/** @deprecated prefer fetchAllScreenerAssets — kept for scripts that pass a key */
async function fetchScreener(key: string): Promise<ScreenerAsset[]> {
  const fetchPage = async (offset: number) => {
    const url = `${DATAPI_BASE}?stocks=${key}&offset=${offset}&includeOndoStatus=false`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`datapi ${key} returned ${res.status}`);
    return res.json() as Promise<{ assets: ScreenerAsset[]; total: number }>;
  };

  const first = await fetchPage(0);
  const assets = [...(first.assets ?? [])];
  const total = first.total ?? 0;

  if (total > PAGE_SIZE) {
    const pageCount = Math.ceil(total / PAGE_SIZE);
    const pages = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) => fetchPage((i + 1) * PAGE_SIZE))
    );
    for (const page of pages) assets.push(...(page.assets ?? []));
  }

  return assets;
}

/**
 * Fetch all tokenized stock tokens from Jupiter's datapi screener.
 * Returns full list with metadata, merging in sector/company from tokens.ts.
 * Falls back to static list on error.
 */
export async function discoverTokens(): Promise<StockToken[]> {
  const knownMints = new Map<string, StockToken>(
    ALL_TOKENS.map(t => [t.mint, t])
  );

  try {
    const assets = await fetchAllScreenerAssets();
    const discovered = assets.map((asset): StockToken => {
      const known = knownMints.get(asset.id);
      const provider = providerFromAsset(asset);
      return {
        mint: asset.id,
        symbol: asset.symbol,
        name: known?.name ?? cleanName(asset.name),
        provider,
        sector: known?.sector ?? 'Other',
        company: known?.company,
      };
    });

    return discovered.length > 0 ? discovered : ALL_TOKENS;
  } catch (e) {
    console.error('[discover-tokens] Falling back to static list:', e);
    return ALL_TOKENS;
  }
}

/**
 * Fetch live price data for all tokenized stocks from Jupiter's datapi screener.
 * Returns a map of mint address → price entry.
 *
 * mcap = on-chain tokenized market cap (asset.mcap)
 * underlyingMcap = real-world equity mcap from stockData (trillions) — for dedupe/reference only
 */
export async function fetchScreenerPrices(): Promise<Record<string, {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  stockPrice: number | null;
  mcap: number | null;
  underlyingMcap: number | null;
}>> {
  try {
    const all = await fetchAllScreenerAssets();
    const priceMap: Record<string, {
      price: number | null;
      change24h: number | null;
      volume24h: number | null;
      liquidity: number | null;
      stockPrice: number | null;
      mcap: number | null;
      underlyingMcap: number | null;
    }> = {};

    for (const asset of all) {
      const vol24h = asset.stats24h
        ? (asset.stats24h.buyVolume ?? 0) + (asset.stats24h.sellVolume ?? 0)
        : null;
      priceMap[asset.id] = {
        price: asset.usdPrice ?? null,
        change24h: asset.stats24h?.priceChange ?? null,
        volume24h: vol24h,
        liquidity: asset.liquidity ?? null,
        stockPrice: asset.stockData?.price ?? null,
        // on-chain token mcap — NOT stockData.mcap (equity $T)
        mcap: asset.mcap ?? null,
        underlyingMcap: asset.stockData?.mcap ?? null,
      };
    }

    return priceMap;
  } catch (e) {
    console.error('[discover-tokens] fetchScreenerPrices failed:', e);
    return {};
  }
}

export { fetchScreener, fetchAllScreenerAssets, PROVIDER_LABEL, cleanName };
