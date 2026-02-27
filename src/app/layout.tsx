import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stocks.sol.new'),
  title: {
    default: 'Stocks on Solana — Tokenized Stock Screener',
    template: '%s | Stocks on Solana',
  },
  description: 'Real-time screener for 251+ tokenized stocks on Solana. Track xStocks, Ondo Finance, and PreStocks — prices, liquidity, and discount to real-world price.',
  keywords: [
    'tokenized stocks',
    'stocks on solana',
    'xStocks',
    'Ondo Finance',
    'PreStocks',
    'tokenized equity',
    'solana DeFi',
    'on-chain stocks',
    'real world assets',
    'RWA',
    'solana screener',
    'TSLA on solana',
    'AAPL on solana',
    'NVDA on solana',
    'tokenized NASDAQ',
    'tokenized NYSE',
  ],
  authors: [{ name: 'Stocks on Solana', url: 'https://stocks.sol.new' }],
  creator: 'Stocks on Solana',
  publisher: 'Stocks on Solana',
  category: 'finance',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '256x256', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Stocks on Solana — Tokenized Stock Screener',
    description: 'Real-time screener for 251+ tokenized stocks on Solana. Track prices, liquidity, and discount to real-world price.',
    url: 'https://stocks.sol.new',
    siteName: 'Stocks on Solana',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stocks on Solana — Tokenized Stock Screener',
    description: 'Real-time screener for 251+ tokenized stocks on Solana.',
    site: '@metasolbot',
    creator: '@metasolbot',
  },
  alternates: {
    canonical: 'https://stocks.sol.new',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://api.jup.ag" />
        <link rel="dns-prefetch" href="https://api.jup.ag" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: 'var(--font-mono), "JetBrains Mono", monospace' }}>{children}</body>
    </html>
  );
}
