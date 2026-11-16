import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_TWITTER_DESCRIPTION, SITE_URL } from '@/lib/seo';
import './globals.css';

const spaceGrotesk = localFont({
  src: [
    { path: '../fonts/SpaceGrotesk-Light.ttf', weight: '300', style: 'normal' },
    { path: '../fonts/SpaceGrotesk-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/SpaceGrotesk-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/SpaceGrotesk-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/SpaceGrotesk-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: [
    { path: '../fonts/JetBrainsMono-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/JetBrainsMono-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
});

const GA_ID = 'G-79CB6BK271';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Stocks on Solana',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'tokenized stocks',
    'stocks on solana',
    'xStocks',
    'LSE tokenized stocks',
    'Ondo Finance',
    'PreStocks',
    'Sunrise',
    'tokenized equity',
    'Solana RWA',
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'Stocks on Solana',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_TWITTER_DESCRIPTION,
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.jup.ag" />
        <link rel="dns-prefetch" href="https://api.jup.ag" />
        <link rel="preconnect" href="https://datapi.jup.ag" />
        <link rel="dns-prefetch" href="https://datapi.jup.ag" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        style={{
          fontFamily: 'var(--font-sans), "Space Grotesk", system-ui, sans-serif',
        }}
      >
        {children}
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
