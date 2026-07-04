import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin, requireTenantCitizen } from '@/lib/auth';
import { createCivicAction, listCivicActions } from '@/services/civic-stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method === 'GET') {
      const admin = await requireTenantAdmin(req, tenantSlug);
      const citizen = admin ? null : await requireTenantCitizen(req, tenantSlug);

      if (!admin && !citizen) {
        return unauthorized(res);
      }

      const actions = await listCivicActions(tenantSlug, {
        status: String(req.query.status || 'ALL'),
        type: String(req.query.type || 'ALL'),
        mineCitizenId: !admin && citizen ? citizen.citizen.id : null,
        userId: admin?.user.id || null
      });

      return ok(res, actions.map(serializeAction));
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const citizenAuth = await requireTenantCitizen(req, tenantSlug);
      const action = await createCivicAction({
        tenantSlug,
        citizenId: citizenAuth?.citizen.id || null,
        type: body.type,
        title: body.title,
        description: body.description,
        locationText: body.locationText,
        latitude: body.latitude ? Number(body.latitude) : null,
        longitude: body.longitude ? Number(body.longitude) : null,
        photoUrl: body.photoUrl,
        participantName: body.participantName,
        participantEmail: body.participantEmail,
        participantPhone: body.participantPhone,
        rewardDestinationPublicKey: body.rewardDestinationPublicKey
      });

      return created(res, serializeAction(action));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process civic action.';
    return req.method === 'POST' ? badRequest(res, message) : serverError(res, error);
  }
}

function serializeAction(action: any) {
  return {
    ...action,
    rewardAmount: action.rewardAmount ? String(action.rewardAmount) : '0',
    createdAt: action.createdAt?.toISOString?.() || action.createdAt,
    updatedAt: action.updatedAt?.toISOString?.() || action.updatedAt,
    reviewedAt: action.reviewedAt?.toISOString?.() || action.reviewedAt,
    rewardPaidAt: action.rewardPaidAt?.toISOString?.() || action.rewardPaidAt
  };
}
