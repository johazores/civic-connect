import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, notFound, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asOptionalString, asString, hasRequiredStrings } from '@/lib/request';
import { getTenantBySlug } from '@/services/tenant-service';

function parseDate(value: unknown) {
  const clean = asString(value);

  if (!clean) {
    return new Date();
  }

  const date = new Date(clean);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method === 'GET') {
      const tenant = await getTenantBySlug(tenantSlug);

      if (!tenant) {
        return notFound(res, 'Tenant not found.');
      }

      const includeUnpublished = req.query.includeUnpublished === 'true';
      const auth = includeUnpublished ? await requireTenantAdmin(req, tenantSlug) : null;

      if (includeUnpublished && !auth) {
        return unauthorized(res);
      }

      const posts = await prisma.newsPost.findMany({
        where: { tenantId: tenant.id, ...(includeUnpublished ? {} : { isPublished: true }) },
        orderBy: [{ isPublished: 'desc' }, { publishedAt: 'desc' }]
      });

      return ok(res, posts);
    }

    if (req.method === 'POST') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const body = req.body || {};

      if (!hasRequiredStrings(body, ['title', 'excerpt', 'content'])) {
        return badRequest(res, 'News title, excerpt, and content are required.');
      }

      const post = await prisma.newsPost.create({
        data: {
          tenantId: auth.tenant.id,
          title: asString(body.title),
          excerpt: asString(body.excerpt),
          content: asString(body.content),
          imageUrl: asOptionalString(body.imageUrl),
          isPublished: asBoolean(body.isPublished, true),
          publishedAt: parseDate(body.publishedAt)
        }
      });

      return created(res, post);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
