'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import LoadingOrb from '@/components/LoadingOrb';
import TradingViewChart, { toTradingViewSymbol } from '@/components/TradingViewChart';

export type TokenDetailProps = {
  symbol: string;
  name: string;
  mint: string;
  provider: string;
  sector?: string;
  company?: string;
  underlying: string;
  jupUrl: string;
  xstocksUrl: string | null;
  flashUrl: string | null;
  backpackUrl: string | null;
  screenerUrl: string;
  initial?: {
    price: number | null;
    change24h: number | null;
    volume24h: number | null;
    liquidity: number | null;
    stockPrice: number | null;
    mcap: number | null;
    underlyingMcap: number | null;
    icon?: string | null;
  };
};

const PROVIDER_LOGO: Record<string, string> = {
  Sunrise: '/partners/backpack.png',
  Backpack: '/partners/backpack.png',
  xStocks: '/partners/xstocks.png',
  Ondo: '/partners/ondo.png',
  PreStocks: '/partners/prestocks.png',
};

const PROVIDER_COLOR: Record<string, string> = {
  Sunrise: '#e33e3e',
  Backpack: '#e33e3e',
  xStocks: '#00c2ff',
  Ondo: '#6c5ce7',
  PreStocks: '#a855f7',
};

function fmt(n: number | null | undefined, d = 2) {
  if (n == null || Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (Math.abs(n) >= 1) return `$${n.toFixed(d)}`;
  return `$${n.toPrecision(4)}`;
}

function fmtVol(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function TokenDetailClient(props: TokenDetailProps) {
  const {
    symbol,
    name,
    mint,
    provider,
    sector,
    underlying,
    jupUrl,
    xstocksUrl,
    flashUrl,
    backpackUrl,
    screenerUrl,
    initial,
  } = props;

  const [price, setPrice] = useState<number | null>(initial?.price ?? null);
  const [change24h, setChange24h] = useState<number | null>(initial?.change24h ?? null);
  const [volume24h, setVolume24h] = useState<number | null>(initial?.volume24h ?? null);
  const [liquidity, setLiquidity] = useState<number | null>(initial?.liquidity ?? null);
  const [stockPrice, setStockPrice] = useState<number | null>(initial?.stockPrice ?? null);
  const [mcap, setMcap] = useState<number | null>(initial?.mcap ?? null);
  const [underlyingMcap, setUnderlyingMcap] = useState<number | null>(initial?.underlyingMcap ?? null);
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? null);
  const [copied, setCopied] = useState(false);
  const [chartSrc, setChartSrc] = useState<'stock' | 'token' | 'dex'>('stock');

  const providerLogo = PROVIDER_LOGO[provider] || null;
  const providerColor = PROVIDER_COLOR[provider] || '#ffb000';

  // Live refresh from prices API
  useEffect(() => {
    let dead = false;
    const load = async () => {
      try {
        const res = await fetch('/api/prices', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Record<
          string,
          {
            price: number | null;
            change24h: number | null;
            volume24h: number | null;
            liquidity: number | null;
            stockPrice: number | null;
            mcap: number | null;
            underlyingMcap: number | null;
          }
        >;
        const row = data[mint];
        if (!row || dead) return;
        if (row.price != null) setPrice(row.price);
        if (row.change24h != null) setChange24h(row.change24h);
        if (row.volume24h != null) setVolume24h(row.volume24h);
        if (row.liquidity != null) setLiquidity(row.liquidity);
        if (row.stockPrice != null) setStockPrice(row.stockPrice);
        if (row.mcap != null) setMcap(row.mcap);
        if (row.underlyingMcap != null) setUnderlyingMcap(row.underlyingMcap);
      } catch {
        /* ignore */
      }
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => {
      dead = true;
      clearInterval(iv);
    };
  }, [mint]);

  // Company icon via token-icon API (returns image bytes)
  useEffect(() => {
    if (icon) return;
    setIcon(`/api/token-icon?mint=${encodeURIComponent(mint)}&symbol=${encodeURIComponent(symbol)}`);
  }, [mint, symbol, icon]);

  const copyCa = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = mint;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }, [mint]);

  const isUp = change24h == null || change24h >= 0;
  const premium = useMemo(() => {
    if (price == null || stockPrice == null || stockPrice <= 0) return null;
    return ((price - stockPrice) / stockPrice) * 100;
  }, [price, stockPrice]);

  const geckoUrl = `https://www.geckoterminal.com/solana/tokens/${mint}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=price&resolution=15m&bg_color=0a0a0a`;
  const dexUrl = `https://dexscreener.com/solana/${mint}?embed=1&theme=dark&trades=0&info=0`;
  const tvSymbol = toTradingViewSymbol(underlying);

  const solscan = `https://solscan.io/token/${mint}`;
  const companySearch = `https://www.google.com/search?q=${encodeURIComponent(name + ' stock ' + underlying)}`;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Brand bar */}
      <div
        style={{
          height: 3,
          width: '100%',
          marginBottom: 28,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
        }}
      />

      <nav style={{ marginBottom: 28, fontSize: 12, letterSpacing: 1 }}>
        <a href="/" style={{ color: '#ffb000', textDecoration: 'none' }}>
          ← Stocks on Solana
        </a>
        {sector ? (
          <>
            <span style={{ color: '#444', margin: '0 8px' }}>/</span>
            <a href={`/?sector=${encodeURIComponent(sector)}`} style={{ color: '#888', textDecoration: 'none' }}>
              {sector}
            </a>
          </>
        ) : null}
      </nav>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          gap: 18,
          alignItems: 'flex-start',
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#111',
            border: '1px solid #222',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" width={72} height={72} style={{ objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 22, fontWeight: 800, color: '#ffb000' }}>
              {underlying.slice(0, 2)}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                color: providerColor,
                border: `1px solid ${providerColor}55`,
                background: `${providerColor}18`,
                borderRadius: 999,
                padding: '5px 10px',
              }}
            >
              {providerLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={providerLogo} alt="" width={14} height={14} style={{ objectFit: 'contain' }} />
              ) : null}
              {provider.toUpperCase()}
            </span>
            {sector ? (
              <span style={{ fontSize: 11, color: '#666', letterSpacing: 2 }}>{sector.toUpperCase()}</span>
            ) : null}
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: 0.5,
              margin: '0 0 6px',
              lineHeight: 1.15,
              background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {name}{' '}
            <span style={{ color: '#e8e8e8', WebkitTextFillColor: '#e8e8e8' }}>({symbol})</span>
          </h1>

          <div style={{ fontSize: 14, color: '#888' }}>
            Company:{' '}
            <a href={companySearch} target="_blank" rel="noopener noreferrer" style={{ color: '#ccc' }}>
              {name} · ${underlying}
            </a>
          </div>
        </div>
      </div>

      {/* Live price */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'flex-end',
          marginBottom: 20,
          padding: '20px 22px',
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, marginBottom: 6 }}>ON-CHAIN PRICE</div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
              color: '#ffb000',
              lineHeight: 1,
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {price == null ? <LoadingOrb state="searching" size={64} /> : fmt(price)}
          </div>
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: isUp ? 'rgba(0,200,100,0.12)' : 'rgba(220,60,60,0.12)',
            border: `1px solid ${isUp ? 'rgba(0,200,100,0.35)' : 'rgba(220,60,60,0.35)'}`,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
              color: isUp ? '#00c864' : '#dc3c3c',
            }}
          >
            {change24h == null ? '—' : `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`}
          </span>
          <span style={{ fontSize: 11, color: '#888', marginLeft: 8, letterSpacing: 1 }}>24H</span>
        </div>

        {stockPrice != null && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>STOCK MARK</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-mono), monospace', color: '#ccc' }}>
              {fmt(stockPrice)}
              {premium != null && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 13,
                    color: Math.abs(premium) < 0.5 ? '#666' : premium > 0 ? '#00c864' : '#dc3c3c',
                  }}
                >
                  ({premium >= 0 ? '+' : ''}
                  {premium.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          ['LIQUIDITY', fmtVol(liquidity)],
          ['24H VOL', fmtVol(volume24h)],
          ['ON-CHAIN MCAP', fmtVol(mcap)],
          ['EQUITY MCAP', fmtVol(underlyingMcap)],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              background: '#111',
              border: '1px solid #1e1e1e',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 6 }}>{label}</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'var(--font-mono), monospace',
                color: '#e8e8e8',
              }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* CA copy */}
      <div
        style={{
          marginBottom: 22,
          padding: '14px 16px',
          background: '#0d0d0d',
          border: '1px solid #222',
          borderRadius: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, marginBottom: 6 }}>CONTRACT ADDRESS (CA)</div>
          <code
            style={{
              fontSize: 13,
              color: '#ffb000',
              wordBreak: 'break-all',
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            {mint}
          </code>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={copyCa}
            style={{
              background: copied ? 'rgba(0,200,100,0.15)' : 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
              color: copied ? '#00c864' : '#0a0a0a',
              border: copied ? '1px solid rgba(0,200,100,0.4)' : 'none',
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 1,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {copied ? 'COPIED' : 'COPY CA'}
          </button>
          <a
            href={solscan}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #333',
              color: '#aaa',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            SOLSCAN
          </a>
        </div>
      </div>

      {/* Chart — STOCK (TradingView) default · TOKEN (Gecko) · DEX */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontSize: 13, letterSpacing: 2, color: '#ffb000', margin: 0 }}>CHART</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {(
              [
                ['stock', 'STOCK'],
                ['token', 'TOKEN'],
                ['dex', 'DEX'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setChartSrc(key)}
                style={{
                  background: chartSrc === key ? 'rgba(255,176,0,0.12)' : 'transparent',
                  border: `1px solid ${chartSrc === key ? '#ffb000' : '#333'}`,
                  color: chartSrc === key ? '#ffb000' : '#888',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 11,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid #1e1e1e',
            background: '#0d0d0d',
            height: 420,
          }}
        >
          {chartSrc === 'stock' ? (
            <TradingViewChart symbol={tvSymbol} height={420} />
          ) : (
            <iframe
              title={`${symbol} on-chain chart`}
              src={chartSrc === 'token' ? geckoUrl : dexUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="clipboard-write"
              loading="lazy"
            />
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#555', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span>
            {chartSrc === 'stock'
              ? `TradingView · ${tvSymbol} (underlying)`
              : chartSrc === 'token'
                ? 'GeckoTerminal · on-chain token'
                : 'DexScreener · on-chain pool'}
            {' '}· not affiliated
          </span>
          {chartSrc === 'stock' ? (
            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#888', textDecoration: 'none' }}
            >
              Open in TradingView ↗
            </a>
          ) : null}
        </div>
      </div>

      {/* Trade actions — logos only + labels for a11y */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, letterSpacing: 2, color: '#ffb000', margin: '0 0 12px' }}>TRADE</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a href={jupUrl} target="_blank" rel="noopener noreferrer" style={tradeBtn('#c7f284')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/partners/jupiter.png" alt="" width={20} height={20} />
            Jupiter
          </a>
          {xstocksUrl && (
            <a href={xstocksUrl} target="_blank" rel="noopener noreferrer" style={tradeBtn('#00c2ff')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/partners/xstocks.png" alt="" width={20} height={20} />
              xStocks
            </a>
          )}
          {backpackUrl && (
            <a href={backpackUrl} target="_blank" rel="noopener noreferrer" style={tradeBtn('#e33e3e')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/partners/backpack.png" alt="" width={20} height={20} />
              Backpack
            </a>
          )}
          {flashUrl && (
            <a href={flashUrl} target="_blank" rel="noopener noreferrer" style={tradeBtn('#ff3b3b')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/partners/flash.png" alt="" width={20} height={20} />
              Flash
            </a>
          )}
          <a href={screenerUrl} style={tradeBtn('#ffb000')}>
            Screener
          </a>
        </div>
      </div>

      {/* Provider + company cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        <div style={card}>
          <div style={cardLabel}>PROVIDER</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {providerLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={providerLogo} alt="" width={32} height={32} style={{ objectFit: 'contain' }} />
            ) : null}
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: providerColor }}>{provider}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Issuer / venue on Solana</div>
            </div>
          </div>
        </div>
        <div style={card}>
          <div style={cardLabel}>COMPANY</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8' }}>{name}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            Underlying ticker <span style={{ color: '#ffb000', fontWeight: 700 }}>${underlying}</span>
            {sector ? ` · ${sector}` : ''}
          </div>
        </div>
      </div>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, letterSpacing: 2, color: '#ffb000', margin: '0 0 12px' }}>ABOUT</h2>
        <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: '#e8e8e8' }}>{symbol}</strong> is a tokenized stock representing{' '}
          <strong style={{ color: '#e8e8e8' }}>{name}</strong> ({underlying}), issued via {provider} and
          tradeable 24/7 on Solana. Compare the on-chain mark with the real-world stock quote above to spot
          premiums or discounts. Copy the CA to trade in any Solana wallet or DEX.
        </p>
      </section>

      <p style={{ fontSize: 11, color: '#444', lineHeight: 1.5 }}>
        Not financial advice. Tokenized stocks involve smart-contract, liquidity, and regulatory risk.
      </p>
    </div>
  );
}

const card: CSSProperties = {
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: 12,
  padding: '16px 18px',
};

const cardLabel: CSSProperties = {
  fontSize: 10,
  color: '#555',
  letterSpacing: 2,
  marginBottom: 10,
};

function tradeBtn(color: string): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 10,
    border: `1px solid ${color}66`,
    color,
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1,
    background: `${color}14`,
  };
}
