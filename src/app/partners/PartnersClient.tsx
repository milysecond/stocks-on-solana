'use client';

const partners = [
  {
    name: 'Jupiter',
    description: 'The leading DEX aggregator on Solana. All buy orders route through Jupiter for best execution.',
    url: 'https://jup.ag/?ref=yfgv2ibxy07v',
    logo: '/partners/jupiter.png',
  },
  {
    name: 'xStocks',
    description: 'Tokenized equities on Solana — trade stocks including Apple, Tesla, NVIDIA and more with instant settlement.',
    url: 'https://defi.xstocks.fi/points?ref=NEWUSER',
    logo: '/partners/xstocks.png',
    color: '#00c2ff',
  },
  {
    name: 'Backpack',
    description: 'Regulated exchange and Sunrise tokenized equities. Trade, custody, and on-ramp into Solana assets.',
    url: 'https://backpack.exchange/signup?referral=downunder',
    logo: '/partners/backpack.png',
    color: '#e33e3e',
  },
  {
    name: 'Flash Trade',
    description: 'High-performance perpetual futures trading on Solana with up to 100x leverage and deep liquidity.',
    url: 'https://www.flash.trade?referral=newuser',
    logo: '/partners/flash.png',
    color: '#ff3b3b',
  },
  {
    name: 'Ondo',
    description: 'Tokenized stocks and funds on Solana via Ondo Global Markets.',
    url: 'https://ondo.finance',
    logo: '/partners/ondo.png',
    color: '#6c5ce7',
  },
  {
    name: 'PreStocks',
    description: 'Pre-IPO tokenized equity exposure on Solana.',
    url: 'https://prestocks.com',
    logo: '/partners/prestocks.png',
    color: '#a855f7',
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
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8', fontFamily: 'var(--font-sans), "Space Grotesk", system-ui, sans-serif', padding: '60px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ height: 3, width: '100%', marginBottom: 28, background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)', borderRadius: 2 }} />
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 11, letterSpacing: 2 }}>← BACK</a>

        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1, marginTop: 28, marginBottom: 8, background: 'linear-gradient(135deg, #f8f700 0%, #fbae17 45%, #7f47dd 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          Partners
        </h1>
        <p style={{ fontSize: 14, color: '#888', letterSpacing: 0.2, marginBottom: 40 }}>
          The ecosystem powering Stocks on Solana.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {partners.map(p => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '20px 22px', textDecoration: 'none', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#ffb000')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
            >
              {p.logo ? (
                <img src={p.logo} alt="" width={36} height={36} style={{ objectFit: 'contain', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 36, height: 36, flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: p.color || '#ffb000', letterSpacing: 1.5, marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.65 }}>{p.description}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 56, padding: 24, border: '1px dashed #2a2a2a', borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#555', letterSpacing: 1, marginBottom: 12 }}>BECOME A PARTNER</div>
          <a href="mailto:hello@stocksonsolana.com" style={{ fontSize: 12, color: '#ffb000', letterSpacing: 1, textDecoration: 'none' }}>
            hello@stocksonsolana.com →
          </a>
        </div>
      </div>
    </main>
  );
}
