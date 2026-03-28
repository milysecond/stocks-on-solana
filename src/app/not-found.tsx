import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e8e8e8',
        fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 900, color: '#ff9900', letterSpacing: 6, lineHeight: 1 }}>
        404
      </div>
      <div style={{ fontSize: 13, color: '#555', letterSpacing: 3, textTransform: 'uppercase' }}>
        Ticker Not Found
      </div>
      <div style={{ fontSize: 14, color: '#888', maxWidth: 360, marginTop: 8 }}>
        This stock hasn&apos;t been tokenized on Solana yet — or you&apos;ve hit a bad link.
      </div>
      <Link
        href="/"
        style={{
          marginTop: 24,
          padding: '10px 28px',
          background: '#ff9900',
          color: '#0a0a0a',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          textDecoration: 'none',
          borderRadius: 4,
        }}
      >
        ← Back to Screener
      </Link>
    </div>
  );
}
