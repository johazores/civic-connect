import type { Metadata } from 'next';
import { AboutClient } from '@/components/about/about-client';

export const metadata: Metadata = {
  title: 'How CivicTrust Works - Civic Services With Public Proof',
  description:
    'CivicTrust is a civic services platform where service payments can produce permanent public receipts. See how citizens, staff, and organizations use it.'
};

export default function AboutPage() {
  return <AboutClient />;
}
