import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const alt = 'Stocks on Solana — Real-time Stock Screener';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [fontRegData, fontBoldData, logoData] = await Promise.all([
    readFile(path.join(process.cwd(), 'public/fonts/JetBrainsMono-Regular.ttf')),
    readFile(path.join(process.cwd(), 'public/fonts/JetBrainsMono-Bold.ttf')),
    readFile(path.join(process.cwd(), 'public/logo.png')),
  ]);

  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  const stocks = [
    { sym: 'AAPL',  price: '$213.49', chg: '+2.14%', up: true },
    { sym: 'NVDA',  price: '$876.20', chg: '+4.82%', up: true },
    { sym: 'TSLA',  price: '$241.11', chg: '-1.37%', up: false },
    { sym: 'MSFT',  price: '$415.30', chg: '+0.91%', up: true },
    { sym: 'GOOGL', price: '$178.92', chg: '+1.55%', up: true },
  ];

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#0a0a0a',
        display: 'flex',
        fontFamily: '"JetBrains Mono"',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,153,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,153,0,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Amber glow left */}
        <div style={{
          position: 'absolute', left: -100, top: -100,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,153,0,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Amber glow right */}
        <div style={{
          position: 'absolute', right: -100, bottom: -100,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,153,0,0.06) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Top amber bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#ff9900', display: 'flex' }} />

        {/* LEFT PANEL */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 0 0 64px', width: 560, zIndex: 1,
        }}>
          {/* Logo + title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            <img src={logoBase64} width={72} height={72} style={{ borderRadius: 12 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 22, color: '#aaa', letterSpacing: 6, fontWeight: 400 }}>STOCKS ON</div>
              <div style={{ fontSize: 54, color: '#ff9900', letterSpacing: 4, fontWeight: 700, lineHeight: 1 }}>SOLANA</div>
            </div>
          </div>

          <div style={{ fontSize: 15, color: '#555', letterSpacing: 3, marginBottom: 36 }}>
            REAL-TIME TOKENIZED EQUITY SCREENER
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40 }}>
            {[['252+', 'STOCKS'], ['$55.25T', 'MARKET CAP'], ['$9.5M', 'LIQUIDITY']].map(([v, l]) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ff9900' }}>{v}</div>
                <div style={{ fontSize: 11, color: '#555', letterSpacing: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Domain */}
          <div style={{
            marginTop: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 280, height: 36,
            border: '1px solid #3a1e00',
            borderRadius: 6,
            background: '#140a00',
            fontSize: 14, color: '#ff9900', letterSpacing: 2,
          }}>
            stocksonsolana.com
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: '#1e1e1e', alignSelf: 'stretch', margin: '40px 0', display: 'flex' }} />

        {/* RIGHT PANEL — ticker table */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '48px 48px 48px 40px', zIndex: 1,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', fontSize: 11, color: '#555', letterSpacing: 2, marginBottom: 10, paddingLeft: 12 }}>
            <span style={{ width: 120 }}>TICKER</span>
            <span style={{ width: 140 }}>PRICE</span>
            <span>24H</span>
          </div>
          <div style={{ height: 1, background: '#1e1e1e', marginBottom: 8, display: 'flex' }} />

          {stocks.map((s, i) => (
            <div key={s.sym} style={{
              display: 'flex', alignItems: 'center',
              background: i % 2 === 0 ? '#111' : '#0d0d0d',
              borderRadius: 4, marginBottom: 4,
              paddingLeft: 0, overflow: 'hidden',
            }}>
              <div style={{ width: 4, alignSelf: 'stretch', background: s.up ? '#00c864' : '#dc3c3c', display: 'flex' }} />
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', flex: 1 }}>
                <span style={{ width: 120, fontSize: 18, fontWeight: 700, color: '#e8e8e8' }}>{s.sym}</span>
                <span style={{ width: 140, fontSize: 18, color: '#ccc' }}>{s.price}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: s.up ? '#00c864' : '#dc3c3c' }}>{s.chg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'JetBrains Mono', data: fontRegData, weight: 400 },
        { name: 'JetBrains Mono', data: fontBoldData, weight: 700 },
      ],
    }
  );
}
