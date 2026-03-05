import { ALL_TOKENS, StockToken, TokenProvider } from './tokens';

const DATAPI_BASE = 'https://datapi.jup.ag/v2/assets/stocks/24h';

export interface ScreenerAsset {
  id: string;           // mint address
  name: string;
  symbol: string;
  icon?: string;
  usdPrice?: number;
  liquidity?: number;
  stockData?: { id: string; price: number; mcap: number; updatedAt: string };
  stats24h?: {
    priceChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    holderChange?: number;
  };
}

const PROVIDERS: Array<{ key: string; provider: TokenProvider }> = [
  { key: 'xstocks',   provider: 'xStocks'   },
  { key: 'ondo',      provider: 'Ondo'       },
  { key: 'prestocks', provider: 'PreStocks'  },
];

const PAGE_SIZE = 50;

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

  // Paginate if there are more results
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
  // Build lookup from known tokens (for sector/company metadata)
  const knownMints = new Map<string, StockToken>(
    ALL_TOKENS.map(t => [t.mint, t])
  );

  try {
    const results = await Promise.all(
      PROVIDERS.map(async ({ key, provider }) => {
        const assets = await fetchScreener(key);
        return assets.map((asset): StockToken => {
          const known = knownMints.get(asset.id);
          return {
            mint: asset.id,
            symbol: asset.symbol,
            name: known?.name ?? asset.name,
            provider,
            sector: known?.sector ?? 'Other',
            company: known?.company,
          };
        });
      })
    );

    const discovered = results.flat();
    return discovered.length > 0 ? discovered : ALL_TOKENS;
  } catch (e) {
    console.error('[discover-tokens] Falling back to static list:', e);
    return ALL_TOKENS;
  }
}

/**
 * Fetch live price data for all tokenized stocks from Jupiter's datapi screener.
 * Returns a map of mint address → price entry.
 */
export async function fetchScreenerPrices(): Promise<Record<string, {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  stockPrice: number | null;
  mcap: number | null;
}>> {
  try {
    const results = await Promise.all(
      PROVIDERS.map(({ key }) => fetchScreener(key))
    );
    const all = results.flat();
    const priceMap: Record<string, {
      price: number | null;
      change24h: number | null;
      volume24h: number | null;
      liquidity: number | null;
      stockPrice: number | null;
      mcap: number | null;
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
        mcap: asset.stockData?.mcap ?? null,
      };
    }

    return priceMap;
  } catch (e) {
    console.error('[discover-tokens] fetchScreenerPrices failed:', e);
    return {};
  }
}
