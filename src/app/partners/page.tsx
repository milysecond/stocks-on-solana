import { Metadata } from 'next';
import PartnersClient from './PartnersClient';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Partners of Stocks on Solana: Jupiter, xStocks, Ondo, PreStocks, Backpack, and StonkScreener.',
  alternates: { canonical: 'https://stocksonsolana.com/partners' },
  openGraph: {
    title: 'Partners | Stocks on Solana',
    description: 'Ecosystem partners powering tokenized equities on Solana.',
    url: 'https://stocksonsolana.com/partners',
  },
  robots: { index: true, follow: true },
};

export default function PartnersPage() {
  return <PartnersClient />;
}
