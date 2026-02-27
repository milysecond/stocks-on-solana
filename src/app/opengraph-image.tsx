import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Stocks on Solana — Real-time Tokenized Stock Screener';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          backgroundImage: 'linear-gradient(rgba(255,153,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,153,0,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Logo mark */}
        <div style={{
          width: 80, height: 80, borderRadius: 16,
          background: '#111',
          border: '2px solid #ff9900',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 900, color: '#ff9900',
          marginBottom: 28,
          letterSpacing: -2,
        }}>
          S/
        </div>

        {/* Title */}
        <div style={{
          fontSize: 56, fontWeight: 900, color: '#ff9900',
          letterSpacing: 6, marginBottom: 12,
        }}>
          STOCKS ON SOLANA
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 20, color: '#555', letterSpacing: 4, marginBottom: 48,
        }}>
          REAL-TIME TOKENIZED EQUITY SCREENER
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 60, alignItems: 'center',
        }}>
          {[
            { label: 'TOKENS', value: '251+' },
            { label: 'PROVIDERS', value: '3' },
            { label: 'NETWORK', value: 'SOLANA' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#e8e8e8', letterSpacing: 2 }}>{value}</div>
              <div style={{ fontSize: 13, color: '#555', letterSpacing: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div style={{
          position: 'absolute', bottom: 32,
          fontSize: 14, color: '#333', letterSpacing: 3,
        }}>
          STOCKS.SOL.NEW
        </div>
      </div>
    ),
    { ...size }
  );
}
