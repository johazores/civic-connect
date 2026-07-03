import { StellarPlaygroundClient } from '@/components/playground/stellar-playground-client';

export const metadata = {
  title: 'Stellar Testnet Playground | CivicTrust',
  description: 'Beginner-friendly Stellar Testnet playground for SEP-7 payments, Horizon verification, and transaction learning.'
};

const allowedTenants = new Set(['metro-city', 'laguna-province']);

export default async function StellarPlaygroundPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const params = await searchParams;
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const tenant = from && allowedTenants.has(from) ? from : 'metro-city';

  return <StellarPlaygroundClient backHref={`/${tenant}`} />;
}
