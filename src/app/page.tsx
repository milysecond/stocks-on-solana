'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, ExternalLink, Search, TrendingUp } from 'lucide-react';
import { ALL_TOKENS, StockToken } from '@/lib/tokens';

interface PriceData {
  price: number;
  extraInfo?: {
    lastSwappedPrice?: {
      lastJupiterSellAt?: number;
      lastJupiterBuyAt?: number;
    };
  };
}

interface StockRow extends StockToken {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
}

type SortKey = 'name' | 'price' | 'change24h' | 'volume24h' | 'provider';
type SortDir = 'asc' | 'desc';

function fmt(n: number | null, decimals = 2, prefix = '$') {
  if (n === null) return <span style={{ color: 'var(--text-dim)' }}>—</span>;
  return `${prefix}${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function fmtChange(n: number | null) {
  if (n === null) return <span style={{ color: 'var(--text-dim)' }}>—</span>;
  const color = n >= 0 ? 'var(--green)' : 'var(--red)';
  const sign = n >= 0 ? '+' : '';
  return <span style={{ color }}>{sign}{n.toFixed(2)}%</span>;
}

function fmtVol(n: number | null) {
  if (n === null) return <span style={{ color: 'var(--text-dim)' }}>—</span>;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export default function Home() {
  const [rows, setRows] = useState<StockRow[]>(ALL_TOKENS.map(t => ({ ...t, price: null, change24h: null, volume24h: null })));
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prices');
      const data: Record<string, PriceData> = await res.json();
      setRows(prev => prev.map(row => ({
        ...row,
        price: data[row.mint]?.price ?? null,
        change24h: null, // Jupiter v2 doesn't provide 24h change directly
        volume24h: null,
      })));
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const sorted = [...rows]
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.symbol.toLowerCase().includes(search.toLowerCase()))
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
    if (sortKey !== col) return <ArrowUpDown size={12} style={{ color: 'var(--text-dim)' }} />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} style={{ color: 'var(--amber)' }} />
      : <ArrowDown size={12} style={{ color: 'var(--amber)' }} />;
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/auth/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    setEmailSent(true);
  }

  const xCount = rows.filter(r => r.provider === 'xStocks' && r.price !== null).length;
  const ondoCount = rows.filter(r => r.provider === 'Ondo' && r.price !== null).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="var(--amber)" />
          <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>STOCKS ON SOLANA</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stocks..."
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px 5px 30px', color: 'var(--text)', fontSize: 12, width: 180, outline: 'none' }}
          />
        </div>
        <button
          onClick={() => setEmailModal(true)}
          style={{ background: 'var(--amber)', color: '#000', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}
        >
          SIGN IN
        </button>
      </header>

      {/* Status bar */}
      <div style={{ background: '#0f0f0f', borderBottom: '1px solid var(--border)', padding: '4px 24px', display: 'flex', alignItems: 'center', gap: 20, fontSize: 11 }}>
        <span style={{ color: 'var(--text-dim)' }}>
          {lastUpdated ? `LAST UPDATE: ${lastUpdated.toLocaleTimeString()}` : 'LOADING...'}
        </span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--text-dim)' }}>xSTOCKS: <span style={{ color: 'var(--green)' }}>{xCount} LIVE</span></span>
        <span style={{ color: 'var(--text-dim)' }}>ONDO: <span style={{ color: 'var(--blue)' }}>{ondoCount} LIVE</span></span>
        <span style={{ color: 'var(--text-dim)' }}>AUTO-REFRESH: <span style={{ color: 'var(--amber)' }}>30S</span></span>
        <div style={{ flex: 1 }} />
        <button onClick={fetchPrices} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> REFRESH
        </button>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {[
                { key: 'name' as SortKey, label: 'NAME / SYMBOL' },
                { key: 'price' as SortKey, label: 'PRICE' },
                { key: 'change24h' as SortKey, label: '24H CHG' },
                { key: 'volume24h' as SortKey, label: '24H VOL' },
                { key: 'provider' as SortKey, label: 'PROVIDER' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{ padding: '10px 12px', textAlign: col.key === 'name' ? 'left' : 'right', color: 'var(--text-dim)', fontSize: 11, letterSpacing: 1, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontSize: 11, letterSpacing: 1, textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.mint}
                style={{
                  borderBottom: '1px solid #161616',
                  background: i % 2 === 0 ? 'transparent' : '#0c0c0c',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#181818')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#0c0c0c')}
              >
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, flexShrink: 0 }}>
                      {row.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{row.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{row.symbol}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(row.price, row.price && row.price > 100 ? 2 : 4)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmtChange(row.change24h)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmtVol(row.volume24h)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    background: row.provider === 'xStocks' ? 'rgba(255,153,0,0.15)' : 'rgba(68,136,255,0.15)',
                    color: row.provider === 'xStocks' ? 'var(--amber)' : 'var(--blue)',
                    border: `1px solid ${row.provider === 'xStocks' ? 'rgba(255,153,0,0.3)' : 'rgba(68,136,255,0.3)'}`,
                  }}>
                    {row.provider.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <a
                    href={`https://jup.ag/swap/USDC-${row.mint}?referralAccount=yfgv2ibxy07v&referralName=stocksonsolana`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', color: 'var(--amber)', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: 1 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,153,0,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  >
                    BUY <ExternalLink size={10} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', fontSize: 11, color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
        <span>STOCKS ON SOLANA — REAL-TIME TOKENIZED EQUITY SCREENER</span>
        <span>POWERED BY JUPITER · XSTOCKS · ONDO</span>
      </footer>

      {/* Email Modal */}
      {emailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setEmailModal(false); }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 32, width: 380, maxWidth: '90vw' }}>
            <h2 style={{ margin: '0 0 8px', color: 'var(--amber)', fontSize: 16, letterSpacing: 2 }}>ACCESS TERMINAL</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.6 }}>
              Sign in for watchlists, price alerts, and portfolio tracking.
            </p>
            {emailSent ? (
              <div style={{ color: 'var(--green)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                ✓ CHECK YOUR EMAIL FOR A MAGIC LINK
              </div>
            ) : (
              <form onSubmit={submitEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
                />
                <button type="submit" style={{ background: 'var(--amber)', color: '#000', border: 'none', borderRadius: 4, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
                  SEND MAGIC LINK
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
