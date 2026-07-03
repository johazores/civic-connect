import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'CivicTrust',
  description: 'Multitenant civic services and trust platform'
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
      <body className={`${inter.variable} ${sora.variable}`}>{children}</body>
    </html>
  );
}
