'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, ExternalLink, Search, X, TrendingUp, TrendingDown, Droplets, BarChart2, ChevronLeft, ChevronRight, Star, LogOut, Shield, FileText, Handshake } from 'lucide-react';
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
    timeLabel = `CLZ ${Math.floor(minsLeft / 60)}H${minsLeft % 60}M`;
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
      timeLabel = `OPN ${daysLeft}D${hLeft}H`;
    } else {
      timeLabel = `OPN ${hLeft}H${mLeft}M`;
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
    // Local static file for xStocks (instant, no API call)
    if (symbol.endsWith('x') || symbol.includes('.Bx')) {
      setImgSrc(`/icons/${symbol}.png`);
    } else {
      // Other stocks: hit API route (Helius DAS lookup)
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

function ShareBar({ symbol, name, price, change }: { symbol: string; name: string; price: number | null; change: number | null }) {
  const [copied, setCopied] = useState(false);
  const url = `https://stocksonsolana.com?t=${symbol}`;
  const text = `${name} (${symbol})${price !== null ? ` — $${price.toFixed(2)}` : ''}${change !== null ? ` ${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%` : ''} on Stocks on Solana`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shares = [
    {
      label: 'X',
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px 4px' }}>
      <span style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', marginRight: 4 }}>SHARE</span>
      {shares.map(s => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 4, border: '1px solid #2a2a2a', color: 'var(--text-dim)', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--amber)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--amber)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dim)'; }}
        >{s.icon}</a>
      ))}
      <button onClick={copy} title="Copy link"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 4, border: `1px solid ${copied ? 'var(--amber)' : '#2a2a2a'}`, color: copied ? 'var(--amber)' : 'var(--text-dim)', background: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
        {copied
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        }
      </button>
    </div>
  );
}

function TokenModal({ row, onClose, onPrev, onNext, index, total, starred, toggleStar }: {
  row: StockRow;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
  starred: Set<string>;
  toggleStar: (mint: string) => void;
}) {
  const change = fmtChange(row.change24h);
  const disc = row.price !== null && row.stockPrice !== null
    ? ((row.price - row.stockPrice) / row.stockPrice) * 100
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className={`star-btn star-btn-lg ${starred.has(row.mint) ? 'starred' : ''}`}
              onClick={() => toggleStar(row.mint)}
              aria-label={starred.has(row.mint) ? 'Unstar' : 'Star'}
            >
              <Star size={16} />
            </button>
            <button className="tm-close" onClick={onClose}><X size={16} /></button>
          </div>
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
            href={`https://jup.ag/tokens/${row.mint}?ref=yfgv2ibxy07v`}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-buy-btn"
          >
            BUY ON JUPITER <ExternalLink size={12} />
          </a>
        </div>

        {/* Share */}
        <ShareBar symbol={row.symbol} name={row.name} price={row.price} change={row.change24h} />

        {/* Nav */}
        <div className="tm-nav">
          <button className="tm-nav-btn" onClick={onPrev} aria-label="Previous">
            <ChevronLeft size={22} />
            <span>PREV</span>
          </button>
          <span className="tm-nav-count">{index + 1} / {total}</span>
          <button className="tm-nav-btn" onClick={onNext} aria-label="Next">
            <span>NEXT</span>
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopTable({ sorted, setSelectedToken, SortIcon, toggleSort, starred, toggleStar }: {
  sorted: StockRow[];
  setSelectedToken: (r: StockRow) => void;
  SortIcon: ({ col }: { col: SortKey }) => React.ReactElement;
  toggleSort: (k: SortKey) => void;
  starred: Set<string>;
  toggleStar: (mint: string) => void;
}) {
  return (
    <div className="desktop-table">
      <table>
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
        <tbody>
          {sorted.map((row, i) => {
            const change = fmtChange(row.change24h);
            return (
              <tr
                key={row.mint}
                className={i % 2 !== 0 ? 'even' : ''}
                onClick={() => openToken(row)}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 46px' } as React.CSSProperties}
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
                <td onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8 }}>
                  <button
                    className={`star-btn ${starred.has(row.mint) ? 'starred' : ''}`}
                    onClick={() => toggleStar(row.mint)}
                    aria-label={starred.has(row.mint) ? 'Unstar' : 'Star'}
                  >
                    <Star size={12} />
                  </button>
                  <a
                    href={`https://jup.ag/tokens/${row.mint}?ref=yfgv2ibxy07v`}
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
  );
}

function HomeInner() {
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<StockRow[]>(
    ALL_TOKENS.map(t => ({ ...t, price: null, change24h: null, volume24h: null, liquidity: null, stockPrice: null, mcap: null }))
  );
  const [sortKey, setSortKey] = useState<SortKey>('change24h');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<StockRow | null>(null);
  const openToken = (row: StockRow | null) => {
    setSelectedToken(row);
    if (row) window.history.replaceState(null, '', `/${row.symbol.toLowerCase()}`);
    else window.history.replaceState(null, '', '/');
  };
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [tickerScrolling, setTickerScrolling] = useState(false);
  const statusBarRef = React.useRef<HTMLDivElement>(null);
  const statusInnerRef = React.useRef<HTMLDivElement>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInStatus, setSignInStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [starred, setStarred] = useState<Set<string>>(new Set());

  // Load session + stars on mount
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    // Handle magic link redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      window.history.replaceState({}, '', '/');
      fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    }
    try {
      const saved = localStorage.getItem('sos-starred');
      if (saved) setStarred(new Set(JSON.parse(saved)));
    } catch { /* */ }
  }, []);

  const toggleStar = useCallback((mint: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      next.has(mint) ? next.delete(mint) : next.add(mint);
      localStorage.setItem('sos-starred', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const handleSignIn = async () => {
    if (!signInEmail || signInStatus === 'sending') return;
    setSignInStatus('sending');
    try {
      await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail }),
      });
      setSignInStatus('sent');
    } catch {
      setSignInStatus('idle');
    }
  };

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
    const t = setTimeout(fetchPrices, 100);
    const interval = setInterval(fetchPrices, 30000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [fetchPrices]);

  // SOL price — fetch once and refresh every 30s
  useEffect(() => {
    const fetchSol = async () => {
      try {
        const res = await fetch('https://api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112', {
          headers: { 'x-api-key': '3309da44-211b-4acb-9d31-c36fb54d9459' }
        });
        const d = await res.json();
        const p = d?.['So11111111111111111111111111111111111111112']?.usdPrice;
        if (p) setSolPrice(parseFloat(p));
      } catch { /* silent */ }
    };
    fetchSol();
    const iv = setInterval(fetchSol, 30000);
    return () => clearInterval(iv);
  }, []);

  // Handle ?t=TICKER query param (from /token/[ticker] redirect)
  useEffect(() => {
    const t = searchParams.get('t');
    if (t) {
      const match = ALL_TOKENS.find(tok =>
        tok.symbol.toLowerCase() === t.toLowerCase()
      );
      if (match) {
        const row = rows.find(r => r.mint === match.mint);
        if (row) openToken(row);
      }
    }
  }, [searchParams, rows]);

  const { isOpen, timeLabel } = getMarketStatus();

  // Detect if status bar overflows → enable marquee
  useEffect(() => {
    const check = () => {
      const bar = statusBarRef.current;
      const inner = statusInnerRef.current;
      if (!bar || !inner) return;
      const overflows = inner.scrollWidth > bar.clientWidth;
      setTickerScrolling(overflows);
      if (overflows) {
        const duration = Math.max(20, inner.scrollWidth / 40);
        bar.style.setProperty('--ticker-duration', `${duration}s`);
        bar.style.setProperty('--ticker-offset', `-${inner.scrollWidth / 2}px`);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [rows, loading, solPrice]);

  const sorted = [...rows]
    .filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.symbol.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = !providerFilter || r.provider === providerFilter;
      return matchesSearch && matchesProvider;
    })
    .sort((a, b) => {
      // Starred always float to top
      const aStarred = starred.has(a.mint) ? 0 : 1;
      const bStarred = starred.has(b.mint) ? 0 : 1;
      if (aStarred !== bStarred) return aStarred - bStarred;
      // Then apply normal sort
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

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
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
          margin-right: 0;
        }
        .header-pbs {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .header-pbs:hover { opacity: 1; }
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
        .header-x-link { color: var(--text-dim); display: flex; align-items: center; flex-shrink: 0; transition: color 0.15s; }
        .header-x-link:hover { color: var(--amber); }
        .signin-btn { background: none; border: 1px solid #2a2a2a; color: var(--text-dim); font-family: inherit; font-size: 9px; letter-spacing: 2px; padding: 5px 10px; border-radius: 4px; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
        .signin-btn:hover { border-color: var(--amber); color: var(--amber); }
        .star-btn { background: none; border: none; cursor: pointer; color: #333; padding: 2px; display: flex; align-items: center; transition: color 0.15s; flex-shrink: 0; }
        .star-btn:hover { color: var(--amber); }
        .star-btn.starred { color: var(--amber); }
        .star-btn-lg { padding: 4px; }
        .star-btn-lg svg { width: 16px; height: 16px; }

        /* ── Status bar ── */
        .status-bar {
          background: #0d0d0d;
          border-bottom: 1px solid var(--border);
          padding: 0 14px;
          height: 28px;
          display: flex;
          align-items: center;
          font-size: 10px;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
        }
        .status-bar-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
          will-change: transform;
        }
        .status-bar-inner.scrolling {
          animation: ticker-scroll var(--ticker-duration, 30s) linear infinite;
          padding-right: 80px;
        }
        .status-bar-inner.scrolling:hover { animation-play-state: paused; }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(var(--ticker-offset, -50%)); }
        }
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
        .tm-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .tm-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 20px;
          color: var(--text);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s, color 0.1s;
          flex: 1;
          justify-content: center;
        }
        .tm-nav-btn:hover {
          background: rgba(255,153,0,0.08);
          border-color: rgba(255,153,0,0.4);
          color: var(--amber);
        }
        .tm-nav-btn:active { background: rgba(255,153,0,0.15); }
        .tm-nav-count {
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 1px;
          white-space: nowrap;
          min-width: 52px;
          text-align: center;
        }
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
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-size: 9px;
          color: #333;
          letter-spacing: 2px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
          z-index: 40;
          overflow: hidden;
        }
        .footer-pbs { opacity: 0.6; transition: opacity 0.15s; display: flex; align-items: center; flex-shrink: 0; }
        .footer-pbs:hover { opacity: 1; }
        .footer-link { color: #444; text-decoration: none; letter-spacing: 2px; font-size: 9px; flex-shrink: 0; transition: color 0.15s; }
        .footer-link:hover { color: var(--amber); }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; padding-top: 8px; }
          .header-brand span { font-size: 11px; }
          .header-pbs { display: none; }
        }
        @media (min-width: 641px) {
          .sort-bar { display: none; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 44 }}>
        {/* Visually hidden H1 for SEO / heading order */}
        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
          Stocks on Solana — Real-time Stock Screener
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
              placeholder="Search stocks..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <a href="https://x.com/stocksonsolana" target="_blank" rel="noopener noreferrer" className="header-x-link" aria-label="Follow on X">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>{user.email.split('@')[0].toUpperCase()}</span>
              <button className="signin-btn" onClick={handleLogout} title="Sign out" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <LogOut size={10} />
              </button>
            </div>
          ) : (
            <button className="signin-btn" onClick={() => setShowSignIn(true)}>SIGN IN</button>
          )}
        </header>

        {/* Sign In Modal */}
        {showSignIn && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowSignIn(false); setSignInStatus('idle'); setSignInEmail(''); } }}>
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 32, width: '100%', maxWidth: 400, position: 'relative' }}>
              <button onClick={() => { setShowSignIn(false); setSignInStatus('idle'); setSignInEmail(''); }} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>✕</button>
              <div style={{ color: '#ff9900', fontSize: 13, letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>SIGN IN</div>
              <div style={{ color: '#555', fontSize: 11, letterSpacing: 1, marginBottom: 24 }}>Get a magic link sent to your email</div>
              {signInStatus === 'sent' ? (
                <div style={{ color: '#00c864', fontSize: 13, letterSpacing: 1, textAlign: 'center', padding: '16px 0' }}>
                  ✓ CHECK YOUR EMAIL
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '10px 12px', color: '#ccc', fontFamily: 'inherit', fontSize: 16, outline: 'none' }}
                  />
                  <button onClick={handleSignIn} disabled={signInStatus === 'sending'} style={{ width: '100%', background: '#ff9900', color: '#000', border: 'none', borderRadius: 4, padding: '12px', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>
                    {signInStatus === 'sending' ? '...' : 'SEND MAGIC LINK'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="status-bar" ref={statusBarRef}>
          <div className={`status-bar-inner ${tickerScrolling ? 'scrolling' : ''}`} ref={statusInnerRef}>
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
            { label: 'X', provider: 'xStocks', count: xCount, total: rows.filter(r => r.provider === 'xStocks').length },
            { label: 'ONDO', provider: 'Ondo', count: ondoCount, total: rows.filter(r => r.provider === 'Ondo').length },
            { label: 'PRE', provider: 'PreStocks', count: preCount, total: rows.filter(r => r.provider === 'PreStocks').length },
          ].map(({ label, provider, count, total }, i, arr) => {
            const active = providerFilter === provider;
            return (
              <span key={label}>
                <button
                  onClick={() => { setProviderFilter(active ? null : provider); setPage(1); }}
                  style={{
                    background: active ? 'rgba(255,153,0,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(255,153,0,0.4)' : '1px solid transparent',
                    borderRadius: 3, padding: '1px 5px', cursor: 'pointer',
                    color: active ? 'var(--amber)' : 'inherit', fontSize: 10,
                    letterSpacing: 1, fontWeight: active ? 700 : 400,
                  }}
                >
                  <span style={{ color: active ? 'var(--amber)' : 'var(--text-dim)' }}>{label} </span>
                  <span style={{ color: 'var(--amber)' }}>{count}/{total}</span>
                </button>
                {i < arr.length - 1 && <span className="sep" style={{ marginLeft: 6 }}>|</span>}
              </span>
            );
          })}
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
          {solPrice && <>
            <span className="sep">|</span>
            <span style={{ color: 'var(--text-dim)' }}>SOL </span>
            <span style={{ color: 'var(--amber)', fontWeight: 700 }}>${solPrice.toFixed(2)}</span>
          </>}
          <button className="refresh-btn" onClick={fetchPrices}>
            <RefreshCw size={9} className={loading ? 'animate-spin' : ''} style={loading ? { color: '#ff9900' } : {}} />
            REFRESH
          </button>
          {/* Duplicate for seamless loop when scrolling */}
          </div>
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

        {/* Desktop table */}
        <DesktopTable sorted={paged} setSelectedToken={openToken} SortIcon={SortIcon} toggleSort={toggleSort} starred={starred} toggleStar={toggleStar} />

        {/* Mobile cards */}
        <div className="mobile-cards">
          {paged.map(row => {
            const change = fmtChange(row.change24h);
            return (
              <div key={row.mint} className="card" onClick={() => openToken(row)}>
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
                      href={`https://jup.ag/tokens/${row.mint}?ref=yfgv2ibxy07v`}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0 8px', fontFamily: 'inherit', fontSize: 10, letterSpacing: 1 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'none', border: '1px solid #2a2a2a', color: page === 1 ? '#333' : '#888', fontFamily: 'inherit', fontSize: 10, letterSpacing: 1, padding: '4px 10px', borderRadius: 3, cursor: page === 1 ? 'default' : 'pointer' }}>PREV</button>
            <span style={{ color: '#555' }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: 'none', border: '1px solid #2a2a2a', color: page === totalPages ? '#333' : '#888', fontFamily: 'inherit', fontSize: 10, letterSpacing: 1, padding: '4px 10px', borderRadius: 3, cursor: page === totalPages ? 'default' : 'pointer' }}>NEXT</button>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <a href="/privacy" className="footer-link" title="Privacy Policy"><Shield size={14} /></a>
          <a href="/partners" className="footer-link" title="Partners"><Handshake size={14} /></a>
          <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="footer-pbs" aria-label="Powered by Solana">
            <img src="/stacked-white.svg" alt="Powered by Solana" style={{ display: 'block', height: 26, width: 'auto', borderRadius: 5 }} />
          </a>
          <a href="/terms" className="footer-link" title="Terms of Service"><FileText size={14} /></a>
        </footer>

        {/* Token detail modal */}
        {selectedToken && (() => {
          const idx = sorted.findIndex(r => r.mint === selectedToken.mint);
          const prev = () => openToken(sorted[(idx - 1 + sorted.length) % sorted.length]);
          const next = () => openToken(sorted[(idx + 1) % sorted.length]);
          return (
            <TokenModal
              row={selectedToken}
              onClose={() => openToken(null)}
              onPrev={prev}
              onNext={next}
              index={idx}
              total={sorted.length}
              starred={starred}
              toggleStar={toggleStar}
            />
          );
        })()}
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
