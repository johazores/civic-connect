import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CivicTrust',
  description: 'Multitenant civic services and trust platform'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
