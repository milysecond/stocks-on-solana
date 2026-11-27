import { COINGECKO_MAP } from './coingecko-ids';

export type CoinGeckoRef = {
  /** CoinGecko coin id, when the mint is listed on coingecko.com */
  coinId: string | null;
  /** Top GeckoTerminal (CoinGecko's on-chain arm) Solana pool for the mint */
  pool: string | null;
};

export function getCoinGeckoRef(mint: string): CoinGeckoRef {
  const row = COINGECKO_MAP[mint];
  return { coinId: row?.[0] || null, pool: row?.[1] || null };
}
