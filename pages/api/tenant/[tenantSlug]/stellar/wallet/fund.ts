import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { fundTenantTestnetWallet } from '@/services/stellar-wallet-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method !== 'POST') {
      return methodNotAllowed(res);
    }

    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const wallet = await fundTenantTestnetWallet(tenantSlug);
    return ok(res, wallet);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fund Stellar Testnet wallet.';
    return badRequest(res, message);
  }
}
