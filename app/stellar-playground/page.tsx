import { StellarPlaygroundClient } from '@/components/playground/stellar-playground-client';

export const metadata = {
  title: 'Practice Payments | CivicTrust',
  description: 'Beginner-friendly practice page for wallet payments, QR codes, and public receipts.'
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
