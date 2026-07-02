import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, notFound, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asOptionalString, asString, hasRequiredStrings } from '@/lib/request';

function parseDate(value: unknown, fallback: Date) {
  const clean = asString(value);

  if (!clean) {
    return fallback;
  }

  const date = new Date(clean);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const existing = await prisma.newsPost.findFirst({ where: { id, tenantId: auth.tenant.id } });

    if (!existing) {
      return notFound(res, 'News post not found.');
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['title', 'excerpt', 'content'])) {
        return badRequest(res, 'News title, excerpt, and content are required.');
      }

      const post = await prisma.newsPost.update({
        where: { id },
        data: {
          title: asString(body.title),
          excerpt: asString(body.excerpt),
          content: asString(body.content),
          imageUrl: asOptionalString(body.imageUrl),
          isPublished: asBoolean(body.isPublished, existing.isPublished),
          publishedAt: parseDate(body.publishedAt, existing.publishedAt)
        }
      });

      return ok(res, post);
    }

    if (req.method === 'DELETE') {
      await prisma.newsPost.update({ where: { id }, data: { isPublished: false } });
      return ok(res, { success: true });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
