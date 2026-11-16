import type { QuoteCurrency } from './tokens';

export function formatMoney(
  n: number | null | undefined,
  currency: QuoteCurrency = 'USD',
  decimals = 2,
): string {
  if (n == null || Number.isNaN(n)) return '—';
  const body = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = n < 0 ? '-' : '';
  return currency === 'GBP' ? `${sign}£${body}` : `${sign}$${body}`;
}

/** Pounds from an issuer USD equivalent and a GBPUSD rate (USD per 1 GBP). */
export function gbpFromUsd(usd: number | null, gbpUsd: number | null): number | null {
  if (usd == null || gbpUsd == null || gbpUsd <= 0) return null;
  return usd / gbpUsd;
}
