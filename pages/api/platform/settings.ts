import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requirePlatformAdmin } from '@/lib/auth';
import {
  bootstrapEnvironmentKeys,
  isDatabaseManagedRuntimeKey,
  listRuntimeSettings,
  upsertRuntimeSettings,
  type DatabaseManagedRuntimeKey
} from '@/lib/runtime-settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const admin = await requirePlatformAdmin(req);

    if (!admin) {
      return unauthorized(res);
    }

    if (req.method === 'GET') {
      const settings = await listRuntimeSettings();
      return ok(res, {
        settings,
        databaseManagedKeys: settings.map((setting) => setting.key),
        bootstrapEnvironmentKeys
      });
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      const rawSettings = body.settings && typeof body.settings === 'object' ? body.settings : body;
      const settings: Partial<Record<DatabaseManagedRuntimeKey, string>> = {};
      const blockedKeys: string[] = [];

      for (const [key, value] of Object.entries(rawSettings)) {
        if (isDatabaseManagedRuntimeKey(key)) {
          settings[key] = String(value || '');
        } else {
          blockedKeys.push(key);
        }
      }

      if (blockedKeys.length > 0) {
        return badRequest(res, `These settings cannot be managed in the database: ${blockedKeys.join(', ')}.`);
      }

      const updated = await upsertRuntimeSettings(settings);
      return ok(res, { settings: updated });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
