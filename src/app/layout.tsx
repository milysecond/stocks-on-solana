import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stocks on Solana — Tokenized Stock Screener',
  description: 'Real-time screener for tokenized stocks on Solana. Track xStocks, Ondo, and more.',
  openGraph: {
    title: 'Stocks on Solana',
    description: 'Real-time screener for tokenized stocks on Solana.',
    url: 'https://stocksonsolana.com',
    siteName: 'Stocks on Solana',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
