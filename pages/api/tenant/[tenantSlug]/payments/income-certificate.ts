import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, notFound, ok, serverError } from '@/lib/api-response';
import { getCitizenAuthUser } from '@/lib/auth';
import { buildIncomeCertificate } from '@/services/payment-certificate-service';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res);
    }

    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant) {
      return notFound(res, 'Tenant not found.');
    }

    const citizen = await getCitizenAuthUser(req);
    const payerEmail = typeof req.query.email === 'string' ? req.query.email : citizen?.email || null;
    const payerName = typeof req.query.name === 'string' ? req.query.name : citizen?.name || null;
    const citizenId = citizen && citizen.tenantId === tenant.id ? citizen.id : null;

    if (!payerEmail && !citizenId) {
      return notFound(res, 'Sign in or provide an email to generate a payment certificate.');
    }

    const certificate = await buildIncomeCertificate({
      tenantSlug,
      payerEmail,
      citizenId,
      payerName
    });

    if (!certificate) {
      return notFound(res, 'No verified payments found for this account.');
    }

    return ok(res, certificate);
  } catch (error) {
    return serverError(res, error);
  }
}
