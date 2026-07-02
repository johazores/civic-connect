import { prisma } from '@/lib/db';
import { safeTenantSelect } from '@/lib/auth';

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findFirst({
    where: {
      slug,
      isActive: true
    },
    select: safeTenantSelect
  });
}

export async function getTenantHomeData(slug: string) {
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    return null;
  }

  const [services, hotlines, newsPosts, categories] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      take: 4
    }),
    prisma.hotline.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: [{ isEmergency: 'desc' }, { sortOrder: 'asc' }],
      take: 3
    }),
    prisma.newsPost.findMany({
      where: { tenantId: tenant.id, isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 3
    }),
    prisma.reportCategory.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return { tenant, services, hotlines, newsPosts, categories };
}
