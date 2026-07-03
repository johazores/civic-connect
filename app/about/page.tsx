import type { Metadata } from 'next';
import { AboutClient } from '@/components/about/about-client';

export const metadata: Metadata = {
  title: 'How CivicTrust Works — Verifiable Civic Services on Stellar',
  description:
    'CivicTrust is a civic services platform where every service payment produces a permanent, publicly verifiable Stellar receipt. See how citizens, staff, and organizations use it, and why Stellar replaces opaque traditional payment records.'
};

export default function AboutPage() {
  return <AboutClient />;
}
