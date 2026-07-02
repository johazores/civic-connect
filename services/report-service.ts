import type { ReportPriority, ReportStatus } from '@/types/civic';
import { prisma } from '@/lib/db';
import { createReferenceCode } from '@/lib/reference';

function createTenantPrefix(name: string) {
  const initials = name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (initials || 'CVC').slice(0, 4);
}

async function createUniqueReferenceCode(prefix: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const referenceCode = createReferenceCode(prefix);
    const existing = await prisma.report.findFirst({ where: { referenceCode } });

    if (!existing) {
      return referenceCode;
    }
  }

  return `${prefix}-${Date.now()}`;
}

export type CreateReportInput = {
  categoryId: string;
  reporterName: string;
  reporterEmail?: string;
  reporterPhone?: string;
  title: string;
  description: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  citizenId?: string;
};

export type ListAdminReportsFilters = {
  search?: string;
  status?: string;
  categoryId?: string;
  departmentId?: string;
  priority?: string;
};

export async function createReport(tenantSlug: string, input: CreateReportInput) {
  const tenant = await prisma.tenant.findFirst({
    where: { slug: tenantSlug, isActive: true }
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const category = await prisma.reportCategory.findFirst({
    where: {
      id: input.categoryId,
      tenantId: tenant.id,
      isActive: true
    }
  });

  if (!category) {
    throw new Error('Invalid category');
  }

  const report = await prisma.report.create({
    data: {
      tenantId: tenant.id,
      categoryId: category.id,
      referenceCode: await createUniqueReferenceCode(createTenantPrefix(tenant.cityName || tenant.name || tenant.slug)),
      citizenId: input.citizenId || null,
      reporterName: input.reporterName,
      reporterEmail: input.reporterEmail || null,
      reporterPhone: input.reporterPhone || null,
      title: input.title,
      description: input.description,
      locationText: input.locationText,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      attachments: input.imageUrl
        ? {
            create: {
              imageUrl: input.imageUrl
            }
          }
        : undefined,
      updates: {
        create: {
          status: 'SUBMITTED',
          message: 'Your report was submitted successfully and is waiting for review.',
          isPublic: true
        }
      }
    },
    include: {
      category: true,
      department: true,
      updates: {
        orderBy: { createdAt: 'desc' }
      },
      attachments: true
    }
  });

  return report;
}

export async function findPublicReport(tenantSlug: string, referenceCode: string) {
  return prisma.report.findFirst({
    where: {
      referenceCode,
      tenant: {
        slug: tenantSlug,
        isActive: true
      }
    },
    include: {
      category: true,
      department: true,
      attachments: true,
      updates: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function listAdminReports(tenantId: string, filters: ListAdminReportsFilters = {}) {
  const where: any = { tenantId };

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as ReportStatus;
  }

  if (filters.categoryId && filters.categoryId !== 'ALL') {
    where.categoryId = filters.categoryId;
  }

  if (filters.departmentId && filters.departmentId !== 'ALL') {
    where.departmentId = filters.departmentId === 'UNASSIGNED' ? null : filters.departmentId;
  }

  if (filters.priority && filters.priority !== 'ALL') {
    where.priority = filters.priority as ReportPriority;
  }

  if (filters.search) {
    where.OR = [
      { referenceCode: { contains: filters.search } },
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
      { locationText: { contains: filters.search } },
      { reporterName: { contains: filters.search } },
      { reporterEmail: { contains: filters.search } },
      { reporterPhone: { contains: filters.search } }
    ];
  }

  return prisma.report.findMany({
    where,
    include: {
      category: true,
      department: true,
      attachments: true,
      updates: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { submittedAt: 'desc' },
    take: 100
  });
}

export async function getReportStats(tenantId: string) {
  const [total, submitted, reviewing, assigned, inProgress, resolved, urgent, unassigned] = await Promise.all([
    prisma.report.count({ where: { tenantId } }),
    prisma.report.count({ where: { tenantId, status: 'SUBMITTED' } }),
    prisma.report.count({ where: { tenantId, status: 'REVIEWING' } }),
    prisma.report.count({ where: { tenantId, status: 'ASSIGNED' } }),
    prisma.report.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
    prisma.report.count({ where: { tenantId, status: 'RESOLVED' } }),
    prisma.report.count({ where: { tenantId, priority: 'URGENT' } }),
    prisma.report.count({ where: { tenantId, departmentId: null } })
  ]);

  return { total, submitted, reviewing, assigned, inProgress, resolved, urgent, unassigned };
}

export async function updateReportStatus(params: {
  tenantId: string;
  referenceCode: string;
  status: ReportStatus;
  message: string;
  userId: string;
  departmentId?: string | null;
  priority?: ReportPriority;
  isPublic?: boolean;
}) {
  const report = await prisma.report.findFirst({
    where: {
      tenantId: params.tenantId,
      referenceCode: params.referenceCode
    }
  });

  if (!report) {
    throw new Error('Report not found');
  }

  if (params.departmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: params.departmentId,
        tenantId: params.tenantId,
        isActive: true
      }
    });

    if (!department) {
      throw new Error('Invalid department');
    }
  }

  return prisma.report.update({
    where: { id: report.id },
    data: {
      status: params.status,
      departmentId: params.departmentId === undefined ? report.departmentId : params.departmentId,
      priority: params.priority || report.priority,
      updates: {
        create: {
          status: params.status,
          message: params.message,
          userId: params.userId,
          isPublic: params.isPublic ?? true
        }
      }
    },
    include: {
      category: true,
      department: true,
      attachments: true,
      updates: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}
