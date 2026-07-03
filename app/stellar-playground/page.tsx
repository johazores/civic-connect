import { StellarPlaygroundClient } from '@/components/playground/stellar-playground-client';

export const metadata = {
  title: 'Stellar Testnet Playground | CivicTrust',
  description: 'Beginner-friendly Stellar Testnet playground for SEP-7 payments, Horizon verification, and transaction learning.'
};

export default function StellarPlaygroundPage() {
  return <StellarPlaygroundClient />;
}
