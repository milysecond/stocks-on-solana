'use client';

import { useEffect, useRef } from 'react';

const WIDGET_SRC = 'https://widgets.coingecko.com/gecko-coin-price-chart-widget.js';

let widgetPromise: Promise<void> | null = null;

function loadWidgetScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('gecko-coin-price-chart-widget')) return Promise.resolve();
  if (widgetPromise) return widgetPromise;
  widgetPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = WIDGET_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      widgetPromise = null;
      reject(new Error('CoinGecko widget failed to load'));
    };
    document.head.appendChild(s);
  });
  return widgetPromise;
}

export function coinGeckoCoinUrl(coinId: string): string {
  return `https://www.coingecko.com/en/coins/${encodeURIComponent(coinId)}`;
}

/**
 * CoinGecko price chart widget (dark, transparent) for a token with a CoinGecko listing.
 * @see https://www.coingecko.com/en/widgets
 */
export default function CoinGeckoChart({ coinId, height = 420 }: { coinId: string; height?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    host.innerHTML = '';

    loadWidgetScript()
      .then(() => {
        if (cancelled) return;
        const el = document.createElement('gecko-coin-price-chart-widget');
        el.setAttribute('locale', 'en');
        el.setAttribute('dark-mode', 'true');
        el.setAttribute('transparent-background', 'true');
        el.setAttribute('outlined', 'false');
        el.setAttribute('coin-id', coinId);
        el.setAttribute('currency', 'usd');
        el.setAttribute('initial-currency', 'usd');
        el.setAttribute('width', '0');
        el.setAttribute('height', String(height));
        host.appendChild(el);
      })
      .catch(() => {
        if (cancelled) return;
        host.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:13px;letter-spacing:1px">CoinGecko chart unavailable</div>';
      });

    return () => {
      cancelled = true;
      host.innerHTML = '';
    };
  }, [coinId, height]);

  return (
    <div
      ref={hostRef}
      className="coingecko-chart"
      style={{ width: '100%', height, background: '#0a0a0a', overflow: 'hidden' }}
    />
  );
}
