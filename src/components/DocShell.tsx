import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';

const shell: CSSProperties = {
  minHeight: '100vh',
  background: '#0a0a0a',
  color: '#e8e8e8',
  fontFamily: 'var(--font-sans), "Space Grotesk", system-ui, sans-serif',
  padding: '48px 24px 80px',
};

const wrap: CSSProperties = { maxWidth: 760, margin: '0 auto' };

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main style={shell}>
      <div style={wrap}>
        <div
          style={{
            height: 3,
            width: '100%',
            marginBottom: 28,
            background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
            borderRadius: 2,
          }}
          aria-hidden
        />
        <Link
          href="/"
          style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: 11,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          ← Back
        </Link>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 1,
            marginTop: 28,
            marginBottom: 10,
            background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 40, maxWidth: 560 }}>
            {subtitle}
          </p>
        ) : (
          <div style={{ marginBottom: 32 }} />
        )}

        {children}

        <footer
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: '1px solid #1a1a1a',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a
            href="https://graysunderland.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Design by Gray — opens graysunderland.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid #2a2a2a',
              background: '#111',
              padding: '6px 12px',
              fontSize: 12,
              color: '#aaa',
              textDecoration: 'none',
            }}
          >
            Design by <span style={{ color: '#e8e8e8', fontWeight: 600, marginLeft: 4 }}>Gray</span>
          </a>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, letterSpacing: 1 }}>
            <Link href="/brand" style={{ color: '#666', textDecoration: 'none' }}>
              BRAND
            </Link>
            <Link href="/press" style={{ color: '#666', textDecoration: 'none' }}>
              PRESS
            </Link>
            <Link href="/partners" style={{ color: '#666', textDecoration: 'none' }}>
              PARTNERS
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#666',
          marginBottom: 16,
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: 10,
        padding: '18px 20px',
      }}
    >
      {children}
    </div>
  );
}
