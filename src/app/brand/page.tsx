import type { Metadata } from 'next';
import { PageShell, Section, Card } from '@/components/DocShell';

export const metadata: Metadata = {
  title: 'Brand Guide',
  description:
    'Stocks on Solana brand guide — logo, colours, type, and usage. Design by Gray Sunderland.',
  alternates: { canonical: 'https://stocksonsolana.com/brand' },
  openGraph: {
    title: 'Brand Guide | Stocks on Solana',
    description: 'Logo, colours, type, and usage for Stocks on Solana.',
    url: 'https://stocksonsolana.com/brand',
  },
};

const COLORS = [
  { name: 'Gold', hex: '#F8F700', use: 'Gradient start · highlight' },
  { name: 'Amber', hex: '#FBAE17', use: 'Gradient mid · CTAs · accents' },
  { name: 'Brand amber', hex: '#FFB000', use: 'Solid fallback · links' },
  { name: 'Violet', hex: '#7F47DD', use: 'Gradient end · depth' },
  { name: 'Ink', hex: '#0A0A0A', use: 'Page background' },
  { name: 'Panel', hex: '#111111', use: 'Cards · surfaces' },
  { name: 'Border', hex: '#222222', use: 'Dividers · strokes' },
  { name: 'Muted', hex: '#888888', use: 'Secondary text' },
  { name: 'Body', hex: '#E8E8E8', use: 'Primary text' },
];

const LOGOS = [
  { label: 'Mark (transparent)', href: '/logo-mark.png', note: 'Preferred UI mark' },
  { label: 'App icon (dark)', href: '/logo.png', note: 'Square · black ground' },
  { label: 'SVG gradient', href: '/logo.svg', note: 'Source vector' },
  { label: 'SVG white', href: '/logo-white.svg', note: 'On dark / photo' },
  { label: 'SVG black', href: '/logo-black.svg', note: 'On light' },
  { label: 'Favicon', href: '/favicon.ico', note: 'Browser tab' },
];

export default function BrandPage() {
  return (
    <PageShell
      title="Brand guide"
      subtitle="How to use the Stocks on Solana mark, palette, and type. Identity design by Gray Sunderland."
    >
      <Section title="Design credit">
        <Card>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#ccc', margin: 0 }}>
            Brand identity and logo system by{' '}
            <a
              href="https://graysunderland.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#ffb000', textDecoration: 'none', fontWeight: 600 }}
            >
              Gray Sunderland
            </a>
            {' '}
            — product, brand &amp; UI/UX designer (
            <a
              href="https://x.com/gray_chromatic"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#aaa' }}
            >
              @gray_chromatic
            </a>
            ). Same designer attribution pattern as{' '}
            <a
              href="https://au.superteam.fun"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#aaa' }}
            >
              Superteam Australia
            </a>
            .
          </p>
        </Card>
      </Section>

      <Section title="Logo">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Stocks on Solana mark" width={72} height={72} />
          </div>
          <div
            style={{
              background: '#f4f4f4',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-black.png" alt="Stocks on Solana black mark" width={72} height={72} />
          </div>
          <div
            style={{
              background: '#111',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Stocks on Solana app icon" width={72} height={72} />
          </div>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LOGOS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                download
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
                  <strong style={{ color: '#ffb000' }}>{l.label}</strong>
                  <span style={{ color: '#666', marginLeft: 10 }}>{l.note}</span>
                </span>
                <span style={{ color: '#555', fontSize: 11, letterSpacing: 1 }}>DOWNLOAD</span>
              </a>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 13, color: '#666', marginTop: 14, lineHeight: 1.6 }}>
          Prefer the bare mark without boxes. Don’t recolour the gradient bull, add drop shadows, or
          place the mark on busy gradients that fight the yellow→violet spectrum.
        </p>
      </Section>

      <Section title="Colour">
        <div
          style={{
            height: 48,
            borderRadius: 10,
            marginBottom: 14,
            background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
          }}
          title="Brand gradient"
        />
        <p
          style={{
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
            fontSize: 12,
            color: '#888',
            marginBottom: 16,
          }}
        >
          linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
          }}
        >
          {COLORS.map((c) => (
            <div
              key={c.hex}
              style={{
                border: '1px solid #1e1e1e',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#111',
              }}
            >
              <div style={{ height: 56, background: c.hex }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                    fontSize: 11,
                    color: '#ffb000',
                    marginTop: 2,
                  }}
                >
                  {c.hex}
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{c.use}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <Card>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, marginBottom: 6 }}>UI / DISPLAY</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Space Grotesk</div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 6 }}>
              Primary interface type. Weights 300–700. Clear, modern, stock-screener ready.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, marginBottom: 6 }}>DATA / NUMBERS</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                fontFamily: 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace',
              }}
            >
              JetBrains Mono
            </div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 6 }}>
              Prices, % change, liquidity, and table figures only.
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Voice">
        <Card>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#ccc', fontSize: 14, lineHeight: 1.8 }}>
            <li>Direct. Markets never sleep — neither does the copy.</li>
            <li>No hashtags on social. Lead with volume, mcap, liquidity.</li>
            <li>Tickers as cash tags: $SKHY, $MU, $NVDAx.</li>
            <li>Australian English where it matters; tickers stay as issued.</li>
          </ul>
        </Card>
      </Section>

      <p style={{ fontSize: 13, color: '#555' }}>
        Need assets in bulk? See the{' '}
        <a href="/press" style={{ color: '#ffb000' }}>
          press kit
        </a>
        .
      </p>
    </PageShell>
  );
}
