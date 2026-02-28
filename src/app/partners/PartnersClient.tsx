'use client';

const partners = [
  {
    name: 'Jupiter',
    description: 'The leading DEX aggregator on Solana. All buy orders route through Jupiter for best execution.',
    url: 'https://jup.ag/?ref=yfgv2ibxy07v',
  },
  {
    name: 'Solana',
    description: 'The high-performance blockchain powering tokenized equities with sub-second finality and near-zero fees.',
    url: 'https://solana.com',
  },
  {
    name: 'Helius',
    description: 'Enterprise-grade Solana RPC and API infrastructure powering real-time price and on-chain data.',
    url: 'https://helius.dev',
  },
];

export default function PartnersClient() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8', fontFamily: 'monospace', padding: '60px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 10, letterSpacing: 2 }}>← BACK</a>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ff9900', letterSpacing: 3, marginTop: 32, marginBottom: 8 }}>
          PARTNERS
        </h1>
        <p style={{ fontSize: 11, color: '#555', letterSpacing: 1, marginBottom: 48 }}>
          The ecosystem powering Stocks on Solana.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {partners.map(p => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: '20px 24px', textDecoration: 'none', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#ff9900')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ff9900', letterSpacing: 2, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#666', lineHeight: 1.7, letterSpacing: 0.5 }}>{p.description}</div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 64, padding: '24px', border: '1px dashed #2a2a2a', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#555', letterSpacing: 1, marginBottom: 12 }}>BECOME A PARTNER</div>
          <a href="mailto:hello@stocksonsolana.com" style={{ fontSize: 11, color: '#ff9900', letterSpacing: 2, textDecoration: 'none' }}>
            hello@stocksonsolana.com →
          </a>
        </div>
      </div>
    </main>
  );
}
