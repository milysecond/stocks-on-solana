import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const GA_ID = 'G-79CB6BK271';
const SITE_URL = 'https://stocksonsolana.com';
const DESCRIPTION =
  'Real-time screener for 250+ tokenized stocks on Solana. Track xStocks, Ondo Finance, PreStocks, and Backpack — prices, liquidity, and discount to real-world price.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Stocks on Solana — Tokenized Stock Screener',
    template: '%s | Stocks on Solana',
  },
  description: DESCRIPTION,
  keywords: [
    'tokenized stocks',
    'stocks on solana',
    'xStocks',
    'Ondo Finance',
    'PreStocks',
    'Backpack Securities',
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
  authors: [{ name: 'Stocks on Solana', url: SITE_URL }],
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
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Stocks on Solana',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stocks on Solana — Tokenized Stock Screener',
    description: 'Real-time screener for 250+ tokenized stocks on Solana.',
    site: '@StocksOnSolana',
    creator: '@StocksOnSolana',
  },
  alternates: {
    canonical: SITE_URL,
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
  // Prefer DNS/HTML file verification in GSC; meta kept empty so we don't
  // ship a stale token. Add verification.google if you switch to meta tag.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://api.jup.ag" />
        <link rel="dns-prefetch" href="https://api.jup.ag" />
        <link rel="preconnect" href="https://datapi.jup.ag" />
        <link rel="dns-prefetch" href="https://datapi.jup.ag" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body style={{ fontFamily: 'var(--font-mono), "JetBrains Mono", monospace' }}>
        {children}
        {/* GA4 — afterInteractive keeps LCP clean while still counting pageviews */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              anonymize_ip: true,
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `}
        </Script>
      </body>
    </html>
  );
}
