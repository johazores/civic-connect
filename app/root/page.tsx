import type { Metadata } from 'next';
import { PlatformDashboard } from '@/components/platform/platform-dashboard';

export const metadata: Metadata = {
  title: 'Platform Console — CivicTrust',
  robots: { index: false, follow: false }
};

export default function PlatformConsolePage() {
  return <PlatformDashboard />;
}
