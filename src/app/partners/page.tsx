import { Metadata } from 'next';
import PartnersClient from './PartnersClient';

export const metadata: Metadata = {
  title: 'Partners — Stocks on Solana',
  description: 'Ecosystem partners powering Stocks on Solana — tokenized equities on Solana.',
};

export default function PartnersPage() {
  return <PartnersClient />;
}
