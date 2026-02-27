'use client';

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, ExternalLink, Search, X, TrendingUp, TrendingDown, Droplets, BarChart2 } from 'lucide-react';
import { ALL_TOKENS, StockToken } from '@/lib/tokens';

interface PriceEntry {
  price: number;
  change24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  stockPrice: number | null;
  mcap: number | null;
}

interface StockRow extends StockToken {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  stockPrice: number | null;
  mcap: number | null;
}

type SortKey = 'name' | 'price' | 'change24h' | 'volume24h' | 'provider';
type SortDir = 'asc' | 'desc';

function fmt(n: number | null, decimals = 2) {
  if (n === null) return '—';
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function fmtChange(n: number | null) {
  if (n === null) return null;
  return { value: `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`, positive: n >= 0 };
}

function fmtVol(n: number | null) {
  if (n === null) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function getMarketStatus() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const h = et.getHours();
  const m = et.getMinutes();
  const mins = h * 60 + m;
  const open = 9 * 60 + 30;
  const close = 16 * 60;
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && mins >= open && mins < close;

  let timeLabel = '';
  if (isOpen) {
    const minsLeft = close - mins;
    timeLabel = `CLOSES IN ${Math.floor(minsLeft / 60)}H ${minsLeft % 60}M`;
  } else {
    let minsUntil: number;
    if (isWeekday && mins < open) {
      minsUntil = open - mins;
    } else {
      const daysUntilMon = day === 0 ? 1 : day === 6 ? 2 : (day === 5 && mins >= close) ? 3 : 1;
      const minsToMidnight = (24 * 60) - mins;
      minsUntil = minsToMidnight + (daysUntilMon - 1) * 24 * 60 + open;
    }
    const daysLeft = Math.floor(minsUntil / (60 * 24));
    const hLeft = Math.floor((minsUntil % (60 * 24)) / 60);
    const mLeft = minsUntil % 60;
    if (daysLeft > 0) {
      timeLabel = `OPENS IN ${daysLeft}D ${hLeft}H`;
    } else {
      timeLabel = `OPENS IN ${hLeft}H ${mLeft}M`;
    }
  }
  return { isOpen, timeLabel };
}

function TokenIcon({ symbol, mint, size = 28 }: { symbol: string; mint: string; size?: number }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const letters = symbol.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();

  // Generate stable color from symbol
  const hue = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  useEffect(() => {
    if (mint.endsWith('ondo')) return; // Ondo has no icons — use SVG fallback
    // Local static file for xStocks (instant, no API call)
    if (symbol.endsWith('x') || symbol.includes('.Bx')) {
      setImgSrc(`/icons/${symbol}.png`);
    } else {
      // Other tokens: hit API route (Helius DAS lookup)
      setImgSrc(`/api/token-icon?mint=${encodeURIComponent(mint)}&symbol=${encodeURIComponent(symbol)}`);
    }
  }, [mint, symbol]);

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={symbol}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={{ borderRadius: 6, flexShrink: 0, background: '#1a1a1a' }}
        onError={() => setImgSrc(null)}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: `hsl(${hue}, 35%, 14%)`,
      border: `1px solid hsl(${hue}, 50%, 28%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, color: `hsl(${hue}, 70%, 65%)`,
      fontWeight: 700, flexShrink: 0, letterSpacing: -0.5,
    }}>
      {letters}
    </div>
  );
}

function TokenModal({ row, onClose }: { row: StockRow; onClose: () => void }) {
  const change = fmtChange(row.change24h);
  const disc = row.price !== null && row.stockPrice !== null
    ? ((row.price - row.stockPrice) / row.stockPrice) * 100
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="token-modal">
        {/* Header */}
        <div className="tm-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TokenIcon symbol={row.symbol} mint={row.mint} size={44} />
            <div>
              <div className="tm-name">{row.name}</div>
              <div className="tm-symbol">{row.symbol}</div>
            </div>
          </div>
          <button className="tm-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Price hero */}
        <div className="tm-price-row">
          <div className="tm-price">{row.price !== null ? fmt(row.price, row.price > 100 ? 2 : 4) : '—'}</div>
          {change && (
            <span className={`tm-change ${change.positive ? 'pos' : 'neg'}`}>
              {change.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {change.value}
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div className="tm-stats">
          <div className="tm-stat">
            <div className="tm-stat-label">REAL STOCK PRICE</div>
            <div className="tm-stat-value">{fmt(row.stockPrice)}</div>
          </div>
          <div className="tm-stat">
            <div className="tm-stat-label">DISCOUNT/PREMIUM</div>
            <div className="tm-stat-value" style={{
              color: disc === null ? 'var(--text-dim)'
                : Math.abs(disc) < 0.5 ? 'var(--text-dim)'
                : disc > 0 ? 'var(--green)' : 'var(--red)'
            }}>
              {disc !== null ? `${disc >= 0 ? '+' : ''}${disc.toFixed(2)}%` : '—'}
            </div>
          </div>
          <div className="tm-stat">
            <div className="tm-stat-label"><Droplets size={10} /> LIQUIDITY</div>
            <div className="tm-stat-value">{fmtVol(row.liquidity)}</div>
          </div>
          <div className="tm-stat">
            <div className="tm-stat-label"><BarChart2 size={10} /> 24H VOLUME</div>
            <div className="tm-stat-value">{fmtVol(row.volume24h)}</div>
          </div>
          <div className="tm-stat">
            <div className="tm-stat-label">SECTOR</div>
            <div className="tm-stat-value">{row.sector || '—'}</div>
          </div>
          <div className="tm-stat">
            <div className="tm-stat-label">MARKET CAP</div>
            <div className="tm-stat-value">{fmtVol(row.mcap)}</div>
          </div>
        </div>

        {/* Mint address */}
        <div className="tm-mint">
          <span className="tm-mint-label">MINT</span>
          <span className="tm-mint-addr">{row.mint.slice(0, 8)}…{row.mint.slice(-8)}</span>
        </div>

        {/* Actions */}
        <div className="tm-actions">
          <a
            href={`https://jup.ag/swap/USDC-${row.mint}?ref=yfgv2ibxy07v`}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-buy-btn"
          >
            BUY ON JUPITER <ExternalLink size={12} />
          </a>
          <a
            href={`https://solscan.io/token/${row.mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-link-btn"
          >
            SOLSCAN <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

const ROW_HEIGHT = 46;

function VirtualTable({ sorted, setSelectedToken, SortIcon, toggleSort }: {
  sorted: StockRow[];
  setSelectedToken: (r: StockRow) => void;
  SortIcon: ({ col }: { col: SortKey }) => React.ReactElement;
  toggleSort: (k: SortKey) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="desktop-table">
      <table style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          <col style={{ width: '35%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')} style={{ paddingLeft: 14 }}>
              <span className="th-inner">ASSET <SortIcon col="name" /></span>
            </th>
            <th onClick={() => toggleSort('price')}>
              <span className="th-inner">PRICE <SortIcon col="price" /></span>
            </th>
            <th onClick={() => toggleSort('change24h')}>
              <span className="th-inner">24H <SortIcon col="change24h" /></span>
            </th>
            <th>MARK</th>
            <th onClick={() => toggleSort('volume24h')}>
              <span className="th-inner">LIQUIDITY <SortIcon col="volume24h" /></span>
            </th>
            <th></th>
          </tr>
        </thead>
      </table>
      {/* Virtualized scroll container */}
      <div ref={parentRef} style={{ height: 'calc(100vh - 110px)', overflowY: 'auto' }}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          <table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <tbody>
              {virtualizer.getVirtualItems().map(vItem => {
                const row = sorted[vItem.index];
                const i = vItem.index;
                const change = fmtChange(row.change24h);
                return (
                  <tr
                    key={row.mint}
                    data-index={vItem.index}
                    ref={virtualizer.measureElement}
                    className={i % 2 !== 0 ? 'even' : ''}
                    onClick={() => setSelectedToken(row)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vItem.start}px)` }}
                  >
                    <td style={{ paddingLeft: 14 }}>
                      <div className="name-cell">
                        <TokenIcon symbol={row.symbol} mint={row.mint} size={26} />
                        <div>
                          <div className="token-name">{row.name}</div>
                          <div className="token-symbol">{row.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right price-val">
                      {row.price !== null ? fmt(row.price, row.price > 100 ? 2 : 4) : <span className="loading-cell" />}
                    </td>
                    <td className="text-right">
                      {change
                        ? <span className={change.positive ? 'change-pos' : 'change-neg'}>{change.value}</span>
                        : <span className="loading-cell" />}
                    </td>
                    <td className="text-right">
                      {row.price !== null && row.stockPrice !== null ? (() => {
                        const disc = ((row.price - row.stockPrice) / row.stockPrice) * 100;
                        const color = Math.abs(disc) < 0.5 ? 'var(--text-dim)' : disc > 0 ? 'var(--green)' : 'var(--red)';
                        return <span style={{ color, fontSize: 11 }}>
                          {disc >= 0 ? '+' : ''}{disc.toFixed(2)}%
                          <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{fmt(row.stockPrice, 2)}</div>
                        </span>;
                      })() : <span className="loading-cell" />}
                    </td>
                    <td className="text-right dim">
                      {row.liquidity !== null ? fmtVol(row.liquidity) : <span className="loading-cell" />}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <a
                        href={`https://jup.ag/swap/USDC-${row.mint}?ref=yfgv2ibxy07v`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="buy-btn"
                      >
                        BUY <ExternalLink size={9} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HomeInner() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<StockRow[]>(
    ALL_TOKENS.map(t => ({ ...t, price: null, change24h: null, volume24h: null, liquidity: null, stockPrice: null, mcap: null }))
  );
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<StockRow | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prices');
      const data: Record<string, PriceEntry> = await res.json();
      setRows(prev => prev.map(row => ({
        ...row,
        price: data[row.mint]?.price ?? null,
        change24h: data[row.mint]?.change24h ?? null,
        volume24h: data[row.mint]?.volume24h ?? null,
        liquidity: data[row.mint]?.liquidity ?? null,
        stockPrice: data[row.mint]?.stockPrice ?? null,
        mcap: data[row.mint]?.mcap ?? null,
      })));
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay so page paints first before kicking off price fetch
    const t = setTimeout(fetchPrices, 100);
    const interval = setInterval(fetchPrices, 30000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [fetchPrices]);

  // Handle ?t=TICKER query param (from /token/[ticker] redirect)
  useEffect(() => {
    const t = searchParams.get('t');
    if (t) {
      const match = ALL_TOKENS.find(tok =>
        tok.symbol.toLowerCase() === t.toLowerCase()
      );
      if (match) {
        const row = rows.find(r => r.mint === match.mint);
        if (row) setSelectedToken(row);
      }
    }
  }, [searchParams, rows]);

  const { isOpen, timeLabel } = getMarketStatus();

  const sorted = [...rows]
    .filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: string | number | null, bv: string | number | null;
      if (sortKey === 'name') { av = a.name; bv = b.name; }
      else if (sortKey === 'provider') { av = a.provider; bv = b.provider; }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={10} style={{ color: 'var(--text-dim)', opacity: 0.4 }} />;
    return sortDir === 'asc'
      ? <ArrowUp size={10} style={{ color: 'var(--amber)' }} />
      : <ArrowDown size={10} style={{ color: 'var(--amber)' }} />;
  }

  const xCount = rows.filter(r => r.provider === 'xStocks' && r.price !== null).length;
  const ondoCount = rows.filter(r => r.provider === 'Ondo' && r.price !== null).length;
  const preCount = rows.filter(r => r.provider === 'PreStocks' && r.price !== null).length;

  // Deduplicated total market cap (same mcap = same underlying company)
  const totalMcap = (() => {
    const seen = new Set<string>();
    let total = 0;
    for (const r of rows) {
      if (r.mcap === null || r.mcap === undefined) continue;
      const key = r.mcap.toFixed(0);
      if (!seen.has(key)) { seen.add(key); total += r.mcap; }
    }
    return total;
  })();

  const totalLiq = rows.reduce((s, r) => s + (r.liquidity ?? 0), 0);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-mono), "JetBrains Mono", monospace; }
        body { background: var(--bg); }
        :root {
          --bg: #0a0a0a;
          --bg-secondary: #111111;
          --bg-tertiary: #1a1a1a;
          --border: #1e1e1e;
          --text: #e8e8e8;
          --text-dim: #888;
          --amber: #ff9900;
          --green: #22c55e;
          --red: #ef4444;
          --blue: #4488ff;
        }

        /* ── Header ── */
        .header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 0 14px;
          height: 46px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }
        .header-brand span {
          color: var(--amber);
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
        }
        .header-search {
          flex: 1;
          position: relative;
          max-width: 220px;
          margin-left: auto;
        }
        .header-search svg {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .header-search input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 5px 8px 5px 26px;
          color: var(--text);
          font-size: 11px;
          outline: none;
        }
        .header-search input::placeholder { color: var(--text-dim); }

        /* ── Status bar ── */
        .status-bar {
          background: #0d0d0d;
          border-bottom: 1px solid var(--border);
          padding: 4px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          overflow-x: auto;
          white-space: nowrap;
        }
        .status-bar::-webkit-scrollbar { display: none; }
        .sep { color: #2a2a2a; }
        .refresh-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          flex-shrink: 0;
          margin-left: auto;
          padding: 2px 4px;
        }

        /* ── Sort bar (mobile) ── */
        .sort-bar {
          padding: 7px 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          border-bottom: 1px solid var(--border);
          background: #0d0d0d;
        }
        .sort-bar::-webkit-scrollbar { display: none; }
        .sort-chip {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          color: var(--text-dim);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .sort-chip.active {
          border-color: var(--amber);
          color: var(--amber);
          background: rgba(255,153,0,0.08);
        }

        /* ── Desktop table ── */
        .desktop-table { display: block; }
        .mobile-cards { display: none; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th {
          padding: 7px 10px;
          color: var(--text-dim);
          font-size: 9px;
          letter-spacing: 1px;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
          background: #0d0d0d;
        }
        th:not(:first-child) { text-align: right; }
        th:first-child { text-align: left; }
        .th-inner { display: inline-flex; align-items: center; gap: 3px; }
        td { padding: 7px 10px; }
        tr { border-bottom: 1px solid #131313; transition: background 0.1s; cursor: pointer; }
        tr:hover { background: #161616 !important; }
        tr.even { background: #0c0c0c; }
        .name-cell { display: flex; align-items: center; gap: 8px; }
        .token-name { font-weight: 600; color: var(--text); font-size: 12px; line-height: 1.2; }
        .token-symbol { font-size: 10px; color: var(--text-dim); line-height: 1.2; }
        .text-right { text-align: right; }
        .price-val { font-weight: 600; color: var(--text); }
        .change-pos { color: var(--green); }
        .change-neg { color: var(--red); }
        .dim { color: var(--text-dim); font-size: 11px; }
        .buy-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 3px 8px;
          color: var(--amber);
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 1px;
          transition: background 0.1s;
        }
        .buy-btn:hover { background: rgba(255,153,0,0.1); border-color: rgba(255,153,0,0.3); }

        /* ── Mobile cards ── */
        .card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 11px 13px;
          margin: 0 10px 8px;
          cursor: pointer;
          transition: border-color 0.1s;
        }
        .card:hover { border-color: rgba(255,153,0,0.3); }
        .card:active { background: #161616; }
        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
        }
        .card-left { display: flex; align-items: center; gap: 9px; }
        .card-price { font-size: 16px; font-weight: 700; color: var(--text); }
        .card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .card-meta { display: flex; align-items: center; gap: 8px; }
        .card-vol { font-size: 10px; color: var(--text-dim); }

        /* ── Loading ── */
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes amber-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .loading-cell {
          display: inline-block;
          width: 52px;
          height: 10px;
          border-radius: 3px;
          background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
          background-size: 200% auto;
          animation: shimmer 1.4s linear infinite;
          vertical-align: middle;
        }
        .brand-loader-dots span {
          animation: amber-pulse 1.2s ease-in-out infinite;
          color: var(--amber);
        }
        .brand-loader-dots span:nth-child(2) { animation-delay: 0.2s; }
        .brand-loader-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* ── Token Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
          backdrop-filter: blur(4px);
        }
        .token-modal {
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          width: 100%;
          max-width: 420px;
          padding: 20px;
        }
        .tm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .tm-name { font-size: 15px; font-weight: 700; color: var(--text); }
        .tm-symbol { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
        .tm-close {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          transition: color 0.1s;
        }
        .tm-close:hover { color: var(--text); }
        .tm-price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border);
        }
        .tm-price { font-size: 32px; font-weight: 900; color: var(--text); letter-spacing: -1px; }
        .tm-change {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .tm-change.pos { color: var(--green); background: rgba(34,197,94,0.1); }
        .tm-change.neg { color: var(--red); background: rgba(239,68,68,0.1); }
        .tm-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .tm-stat {
          background: var(--bg-tertiary);
          padding: 10px 12px;
        }
        .tm-stat-label {
          font-size: 9px;
          color: var(--text-dim);
          letter-spacing: 1.5px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tm-stat-value { font-size: 14px; font-weight: 700; color: var(--text); }
        .tm-mint {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--bg-tertiary);
          border-radius: 6px;
          margin-bottom: 14px;
        }
        .tm-mint-label { font-size: 9px; color: var(--text-dim); letter-spacing: 1.5px; flex-shrink: 0; }
        .tm-mint-addr { font-size: 11px; color: var(--text-dim); font-family: monospace; }
        .tm-actions { display: flex; gap: 8px; }
        .tm-buy-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: var(--amber);
          color: #000;
          border: none;
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
          letter-spacing: 1px;
          cursor: pointer;
          transition: opacity 0.1s;
        }
        .tm-buy-btn:hover { opacity: 0.9; }
        .tm-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 10px 12px;
          color: var(--text-dim);
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 1px;
          transition: color 0.1s, border-color 0.1s;
        }
        .tm-link-btn:hover { color: var(--text); border-color: #444; }

        /* ── Footer ── */
        .footer {
          padding: 16px;
          text-align: center;
          font-size: 9px;
          color: #333;
          letter-spacing: 2px;
          border-top: 1px solid var(--border);
          margin-top: 8px;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; padding-top: 8px; }
          .header-brand span { font-size: 11px; }
        }
        @media (min-width: 641px) {
          .sort-bar { display: none; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Visually hidden H1 for SEO / heading order */}
        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
          Stocks on Solana — Real-time Tokenized Stock Screener
        </h1>
        {/* Header */}
        <header className="header">
          <div className="header-brand">
            <img src="/logo.png" alt="Stocks on Solana" width={22} height={22} fetchPriority="high" style={{ borderRadius: 4 }} />
            <span>STOCKS ON SOLANA</span>
          </div>
          <div className="header-search">
            <Search size={12} />
            <input
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* Status bar */}
        <div className="status-bar">
          {loading ? (
            <span className="brand-loader-dots">
              LOADING <span>●</span><span>●</span><span>●</span>
            </span>
          ) : (
            <span style={{ color: 'var(--text-dim)' }}>
              {sorted.length} TOKENS
            </span>
          )}
          <span className="sep">|</span>
          <span style={{ color: isOpen ? 'var(--green)' : 'var(--red)' }}>
            ● NYSE {isOpen ? 'OPEN' : 'CLOSED'}
          </span>
          <span className="sep">|</span>
          <span style={{ color: 'var(--text-dim)' }}>{timeLabel}</span>
          <span className="sep">|</span>
          {[
            { label: 'X', count: xCount, total: rows.filter(r => r.provider === 'xStocks').length },
            { label: 'ONDO', count: ondoCount, total: rows.filter(r => r.provider === 'Ondo').length },
            { label: 'PRE', count: preCount, total: rows.filter(r => r.provider === 'PreStocks').length },
          ].map(({ label, count, total }, i, arr) => (
            <span key={label}>
              <span style={{ color: 'var(--text-dim)' }}>{label} </span>
              <span style={{ color: 'var(--amber)' }}>{count}/{total}</span>
              {i < arr.length - 1 && <span className="sep" style={{ marginLeft: 10 }}>|</span>}
            </span>
          ))}
          {totalMcap > 0 && <>
            <span className="sep">|</span>
            <span style={{ color: 'var(--text-dim)' }}>MCAP </span>
            <span style={{ color: 'var(--amber)' }}>{fmtVol(totalMcap)}</span>
          </>}
          {totalLiq > 0 && <>
            <span className="sep">|</span>
            <span style={{ color: 'var(--text-dim)' }}>LIQ </span>
            <span style={{ color: 'var(--amber)' }}>{fmtVol(totalLiq)}</span>
          </>}
          <button className="refresh-btn" onClick={fetchPrices}>
            <RefreshCw size={9} className={loading ? 'animate-spin' : ''} style={loading ? { color: '#ff9900' } : {}} />
            REFRESH
          </button>
        </div>

        {/* Sort bar (mobile) */}
        <div className="sort-bar">
          <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, flexShrink: 0 }}>SORT:</span>
          {([['name', 'NAME'], ['price', 'PRICE'], ['change24h', '24H'], ['volume24h', 'VOL']] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} className={`sort-chip ${sortKey === key ? 'active' : ''}`} onClick={() => toggleSort(key)}>
              {label}
              {sortKey === key && (sortDir === 'asc' ? <ArrowUp size={9} /> : <ArrowDown size={9} />)}
            </button>
          ))}
        </div>

        {/* Desktop table — virtualized */}
        <VirtualTable sorted={sorted} setSelectedToken={setSelectedToken} SortIcon={SortIcon} toggleSort={toggleSort} />

        {/* Mobile cards */}
        <div className="mobile-cards">
          {sorted.map(row => {
            const change = fmtChange(row.change24h);
            return (
              <div key={row.mint} className="card" onClick={() => setSelectedToken(row)}>
                <div className="card-top">
                  <div className="card-left">
                    <TokenIcon symbol={row.symbol} mint={row.mint} size={28} />
                    <div>
                      <div className="token-name">{row.name}</div>
                      <div className="token-symbol">{row.symbol}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="card-price">
                      {row.price !== null ? fmt(row.price, row.price > 100 ? 2 : 4) : <span className="loading-cell" style={{ width: 70, height: 14 }} />}
                    </div>
                    {change ? (
                      <div style={{ fontSize: 11, marginTop: 2 }}>
                        <span className={change.positive ? 'change-pos' : 'change-neg'}>{change.value}</span>
                      </div>
                    ) : (
                      <div style={{ marginTop: 4 }}><span className="loading-cell" style={{ width: 44, height: 10 }} /></div>
                    )}
                  </div>
                </div>
                <div className="card-bottom">
                  <div className="card-meta">
                    {row.price !== null && row.stockPrice !== null && (() => {
                      const disc = ((row.price - row.stockPrice) / row.stockPrice) * 100;
                      return <span style={{ fontSize: 10, color: Math.abs(disc) < 0.5 ? 'var(--text-dim)' : disc > 0 ? 'var(--green)' : 'var(--red)' }}>
                        {disc >= 0 ? '+' : ''}{disc.toFixed(2)}%
                      </span>;
                    })()}
                    <span className="card-vol">{fmtVol(row.liquidity)} liq</span>
                  </div>
                  <span onClick={e => e.stopPropagation()}>
                    <a
                      href={`https://jup.ag/swap/USDC-${row.mint}?ref=yfgv2ibxy07v`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="buy-btn"
                    >
                      BUY <ExternalLink size={9} />
                    </a>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="footer">
          STOCKS ON SOLANA — REAL-TIME TOKENIZED EQUITY SCREENER
        </footer>

        {/* Token detail modal */}
        {selectedToken && (
          <TokenModal row={selectedToken} onClose={() => setSelectedToken(null)} />
        )}
      </main>
    </>
  );
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Stocks on Solana',
    url: 'https://stocks.sol.new',
    description: 'Real-time screener for 251+ tokenized stocks on Solana. Track prices, liquidity, and discount to real-world price.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    about: {
      '@type': 'FinancialMarket',
      name: 'Tokenized Stock Market on Solana',
      description: 'xStocks, Ondo Finance, and PreStocks tokenized equities trading on Solana',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <HomeInner />
      </Suspense>
    </>
  );
}
