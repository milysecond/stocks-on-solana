import type { Metadata } from 'next';
import { PageShell, Section, Card } from '@/components/DocShell';

export const metadata: Metadata = {
  title: 'Press Kit',
  description:
    'Stocks on Solana press kit — logos, colours, boilerplate, facts, and contacts. Design by Gray Sunderland.',
  alternates: { canonical: 'https://stocksonsolana.com/press' },
  openGraph: {
    title: 'Press Kit | Stocks on Solana',
    description: 'Media & brand assets for Stocks on Solana.',
    url: 'https://stocksonsolana.com/press',
  },
};

const SHORT_BOILERPLATE = `Stocks on Solana (stocksonsolana.com) is a real-time screener for tokenized US equities trading on Solana. Track prices, 24h volume, liquidity, and discount to the underlying stock across xStocks, Sunrise (Backpack Securities), Ondo, PreStocks, and other issuers — routed via Jupiter. The stock market never closes here.`;

const LONG_BOILERPLATE = `Stocks on Solana is a live market screener for tokenized stocks on Solana. The product aggregates listings and market data from Jupiter’s stocks datapi so traders can compare on-chain prices against underlying equity marks, filter by issuer (xStocks, Sunrise / Backpack Securities, Ondo Finance, PreStocks, Shift, Tessera, and more), and jump into trade venues including Jupiter, Flash Trade, and Backpack Exchange.

The brand identity and logo system were designed by Gray Sunderland (graysunderland.com). The product is built and operated with a focus on speed, clarity, and honest liquidity — illiquid marks stay visible, but tradable market cap prefers pools with real depth.

Live: https://stocksonsolana.com
X: @StocksOnSolana
Press: gm@metasal.xyz`;

const FACTS: { k: string; v: string }[] = [
  { k: 'Product', v: 'Stocks on Solana' },
  { k: 'URL', v: 'https://stocksonsolana.com' },
  { k: 'X', v: '@StocksOnSolana' },
  { k: 'Category', v: 'Tokenized equities screener · Solana RWA' },
  { k: 'Data', v: 'Jupiter datapi (stocks)' },
  { k: 'Issuers', v: 'xStocks · Sunrise/Backpack · Ondo · PreStocks · Shift · Tessera' },
  { k: 'Design', v: 'Gray Sunderland — graysunderland.com' },
  { k: 'Press email', v: 'gm@metasal.xyz' },
  { k: 'Tagline', v: 'The stock market never closes here.' },
];

const ASSETS = [
  { name: 'Full press kit (.zip)', href: '/press/stocks-on-solana-press-kit.zip', note: 'Logos + X assets' },
  { name: 'Logo mark PNG', href: '/logo-mark.png', note: 'Transparent' },
  { name: 'App icon PNG', href: '/logo.png', note: '1024² dark' },
  { name: 'SVG gradient', href: '/logo.svg', note: 'Vector source' },
  { name: 'SVG white', href: '/logo-white.svg', note: 'Light mark' },
  { name: 'SVG black', href: '/logo-black.svg', note: 'Dark mark' },
  { name: 'X profile', href: '/brand/x/pfp.png', note: 'Avatar' },
  { name: 'X banner', href: '/brand/x/banner.png', note: 'Header' },
  { name: 'Open Graph', href: '/opengraph-image', note: '1200×630 live' },
];

export default function PressPage() {
  return (
    <PageShell
      title="Press kit"
      subtitle="Everything you need to write about Stocks on Solana — logos, colours, boilerplate, facts, and contacts. Patterned after the Milysec media kit."
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
        <a
          href="/press/stocks-on-solana-press-kit.zip"
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 18px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
            color: '#0a0a0a',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
            letterSpacing: 0.5,
          }}
        >
          Download all assets
        </a>
        <a
          href="mailto:gm@metasal.xyz?subject=Stocks%20on%20Solana%20press"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 18px',
            borderRadius: 8,
            border: '1px solid #2a2a2a',
            color: '#ddd',
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Contact press
        </a>
        <a
          href="/brand"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 18px',
            borderRadius: 8,
            border: '1px solid #2a2a2a',
            color: '#ddd',
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Brand guide
        </a>
      </div>

      <Section title="Design attribution">
        <Card>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#ccc' }}>
            Logo and brand system by{' '}
            <a href="https://graysunderland.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ffb000', fontWeight: 600 }}>
              Gray Sunderland
            </a>
            . Credit line for copy:{' '}
            <em style={{ color: '#aaa' }}>
              “Design by Gray Sunderland (graysunderland.com)”
            </em>
            . Also listed as Designer with Superteam Australia.
          </p>
        </Card>
      </Section>

      <Section title="Boilerplate">
        <Card>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, marginBottom: 8 }}>SHORT · ~70 WORDS</div>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: '#ddd', margin: '0 0 20px' }}>{SHORT_BOILERPLATE}</p>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, marginBottom: 8 }}>LONG · ~130 WORDS</div>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: '#ddd', margin: 0, whiteSpace: 'pre-wrap' }}>
            {LONG_BOILERPLATE}
          </p>
        </Card>
      </Section>

      <Section title="Key facts">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FACTS.map((f) => (
            <div
              key={f.k}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: 12,
                padding: '12px 14px',
                background: '#111',
                border: '1px solid #1e1e1e',
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <span style={{ color: '#666', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
                {f.k}
              </span>
              <span style={{ color: '#e8e8e8' }}>{f.v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Logos & marks">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {['/logo-mark.png', '/logo.png', '/logo-white.png'].map((src) => (
            <div
              key={src}
              style={{
                background: src.includes('white') ? '#1a1a1a' : '#0a0a0a',
                border: '1px solid #1e1e1e',
                borderRadius: 10,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" width={56} height={56} style={{ objectFit: 'contain' }} />
            </div>
          ))}
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ASSETS.map((a) => (
            <li key={a.href}>
              <a
                href={a.href}
                download={a.href.endsWith('.zip') || a.href.match(/\.(png|svg|ico)$/) ? true : undefined}
                target={a.href.startsWith('http') || a.href.includes('opengraph') ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 14px',
                  background: '#111',
                  border: '1px solid #1e1e1e',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#ddd',
                  fontSize: 13,
                }}
              >
                <span>
                  <strong style={{ color: '#ffb000' }}>{a.name}</strong>
                  <span style={{ color: '#666', marginLeft: 10 }}>{a.note}</span>
                </span>
                <span style={{ color: '#555', fontSize: 11, letterSpacing: 1 }}>GET</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Colours">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            ['#F8F700', 'Gold'],
            ['#FBAE17', 'Amber'],
            ['#7F47DD', 'Violet'],
            ['#0A0A0A', 'Ink'],
            ['#E8E8E8', 'Body'],
          ].map(([hex, name]) => (
            <div key={hex} style={{ width: 100 }}>
              <div style={{ height: 48, borderRadius: 8, background: hex, border: '1px solid #222' }} />
              <div style={{ fontSize: 11, marginTop: 6, color: '#aaa' }}>{name}</div>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: '#ffb000' }}>{hex}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#666', marginTop: 12, fontFamily: 'var(--font-mono), monospace' }}>
          linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)
        </p>
      </Section>

      <Section title="Contact">
        <Card>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#ccc' }}>
            Press &amp; partnerships:{' '}
            <a href="mailto:gm@metasal.xyz" style={{ color: '#ffb000' }}>
              gm@metasal.xyz
            </a>
            <br />
            Product:{' '}
            <a href="https://stocksonsolana.com" style={{ color: '#aaa' }}>
              stocksonsolana.com
            </a>
            <br />
            Social:{' '}
            <a href="https://x.com/StocksOnSolana" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>
              @StocksOnSolana
            </a>
          </p>
        </Card>
      </Section>
    </PageShell>
  );
}
