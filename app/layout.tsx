import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { PwaRegister } from '@/components/layout/pwa-register';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  applicationName: 'CivicTrust',
  title: {
    default: 'CivicTrust',
    template: '%s | CivicTrust'
  },
  description: 'Mobile-first civic services, public receipts, and Stellar Testnet payment proof.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'CivicTrust',
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a497b',
  colorScheme: 'light'
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['500', '600', '700', '800']
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable}`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
