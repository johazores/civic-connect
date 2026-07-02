import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { asOptionalString, asString } from '@/lib/request';
import { getTenantStellarWallet, importTenantStellarWallet } from '@/services/stellar-wallet-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (req.method === 'GET') {
      const wallet = await getTenantStellarWallet(tenantSlug);
      return ok(res, wallet);
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      const wallet = await importTenantStellarWallet({
        tenantSlug,
        publicKey: asOptionalString(body.publicKey),
        secretKey: asOptionalString(body.secretKey),
        network: asString(body.network, 'TESTNET'),
        horizonUrl: asOptionalString(body.horizonUrl),
        friendbotUrl: asOptionalString(body.friendbotUrl),
        networkPassphrase: asOptionalString(body.networkPassphrase)
      });

      return ok(res, wallet);
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to manage Stellar wallet.';
    return badRequest(res, message);
  }
}
