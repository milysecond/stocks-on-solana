'use client';

import { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    TradingView?: {
      widget: new (opts: Record<string, unknown>) => unknown;
    };
  }
}

let tvScriptPromise: Promise<void> | null = null;

function loadTvScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.TradingView) return Promise.resolve();
  if (tvScriptPromise) return tvScriptPromise;
  tvScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-tv="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      if (window.TradingView) resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/tv.js';
    s.async = true;
    s.dataset.tv = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('TradingView script failed'));
    document.head.appendChild(s);
  });
  return tvScriptPromise;
}

/** Map underlying equity ticker → TradingView SYMBOL */
export function toTradingViewSymbol(underlying: string): string {
  const u = underlying.toUpperCase().replace(/\s+/g, '');
  // Preferred exchange overrides (TV needs venue prefix for reliability)
  const MAP: Record<string, string> = {
    // Mega-cap / common on NASDAQ
    AAPL: 'NASDAQ:AAPL',
    MSFT: 'NASDAQ:MSFT',
    NVDA: 'NASDAQ:NVDA',
    AMZN: 'NASDAQ:AMZN',
    META: 'NASDAQ:META',
    GOOGL: 'NASDAQ:GOOGL',
    GOOG: 'NASDAQ:GOOG',
    TSLA: 'NASDAQ:TSLA',
    AMD: 'NASDAQ:AMD',
    INTC: 'NASDAQ:INTC',
    NFLX: 'NASDAQ:NFLX',
    AVGO: 'NASDAQ:AVGO',
    ORCL: 'NASDAQ:ORCL',
    CSCO: 'NASDAQ:CSCO',
    ADBE: 'NASDAQ:ADBE',
    COST: 'NASDAQ:COST',
    PEP: 'NASDAQ:PEP',
    QQQ: 'NASDAQ:QQQ',
    TQQQ: 'NASDAQ:TQQQ',
    COIN: 'NASDAQ:COIN',
    HOOD: 'NASDAQ:HOOD',
    MSTR: 'NASDAQ:MSTR',
    CRCL: 'NASDAQ:CRCL',
    // NYSE
    JPM: 'NYSE:JPM',
    V: 'NYSE:V',
    MA: 'NYSE:MA',
    WMT: 'NYSE:WMT',
    KO: 'NYSE:KO',
    DIS: 'NYSE:DIS',
    BA: 'NYSE:BA',
    CAT: 'NYSE:CAT',
    XOM: 'NYSE:XOM',
    CVX: 'NYSE:CVX',
    JNJ: 'NYSE:JNJ',
    PG: 'NYSE:PG',
    UNH: 'NYSE:UNH',
    HD: 'NYSE:HD',
    MRK: 'NYSE:MRK',
    ABT: 'NYSE:ABT',
    LLY: 'NYSE:LLY',
    MCD: 'NYSE:MCD',
    NKE: 'NYSE:NKE',
    IBM: 'NYSE:IBM',
    GE: 'NYSE:GE',
    GS: 'NYSE:GS',
    MS: 'NYSE:MS',
    BAC: 'NYSE:BAC',
    C: 'NYSE:C',
    'BRK.B': 'NYSE:BRK.B',
    BRKB: 'NYSE:BRK.B',
    // ETFs
    SPY: 'AMEX:SPY',
    IWM: 'AMEX:IWM',
    DIA: 'AMEX:DIA',
    GLD: 'AMEX:GLD',
    SLV: 'AMEX:SLV',
    // Oil
    USO: 'AMEX:USO',
  };
  if (MAP[u]) return MAP[u];
  if (MAP[u.replace('.', '')]) return MAP[u.replace('.', '')];
  // Default: NASDAQ (TV resolves many US names); keep dots for class shares
  return `NASDAQ:${u}`;
}

type Props = {
  symbol: string; // TradingView symbol e.g. NASDAQ:INTC
  height?: number;
};

/**
 * TradingView advanced chart (dark). Loads tv.js once, remounts on symbol change.
 * @see https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
 */
export default function TradingViewChart({ symbol, height = 420 }: Props) {
  const uid = useId().replace(/:/g, '');
  const containerId = `tv_${uid}`;
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const host = wrapRef.current;
    if (!host) return;

    host.innerHTML = '';
    const inner = document.createElement('div');
    inner.id = containerId;
    inner.style.height = '100%';
    inner.style.width = '100%';
    host.appendChild(inner);

    loadTvScript()
      .then(() => {
        if (cancelled || !window.TradingView) return;
        // eslint-disable-next-line new-cap
        new window.TradingView.widget({
          autosize: true,
          symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0a0a0a',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          calendar: false,
          support_host: 'https://www.tradingview.com',
          container_id: containerId,
          backgroundColor: '#0a0a0a',
          gridColor: 'rgba(34,34,34,0.6)',
          allow_symbol_change: true,
          details: false,
          hotlist: false,
          withdateranges: true,
        });
      })
      .catch(() => {
        if (!host) return;
        host.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:13px;letter-spacing:1px">TradingView unavailable</div>`;
      });

    return () => {
      cancelled = true;
      if (host) host.innerHTML = '';
    };
  }, [symbol, containerId]);

  return (
    <div
      ref={wrapRef}
      style={{ width: '100%', height, background: '#0a0a0a' }}
      className="tradingview-widget-container"
    />
  );
}
