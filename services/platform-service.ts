import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const DEFAULT_CATEGORIES = [
  { name: 'Roads and Sidewalks', description: 'Potholes, damaged sidewalks, and road hazards.' },
  { name: 'Streetlights and Utilities', description: 'Broken streetlights, exposed wires, and public utilities.' },
  { name: 'Waste and Sanitation', description: 'Missed collection, illegal dumping, and drainage.' },
  { name: 'Public Safety', description: 'Safety hazards and urgent local concerns.' },
  { name: 'Permits and Services', description: 'Business permits, documents, and service requests.' }
];

const DEFAULT_DEPARTMENTS = [
  { name: 'Citizen Services Office' },
  { name: 'Public Works Department' },
  { name: 'Environment and Sanitation Office' },
  { name: 'Public Safety Office' }
];

function normalizeEmail(value: string) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeSlug(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function listTenantsWithStats() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });

  return Promise.all(
    tenants.map(async (tenant: any) => {
      const [reports, services, staff, citizens, payments, verifiedPayments, rewards, disbursements] = await Promise.all([
        prisma.report.count({ where: { tenantId: tenant.id } }),
        prisma.service.count({ where: { tenantId: tenant.id, isActive: true } }),
        prisma.user.count({ where: { tenantId: tenant.id, isActive: true } }),
        prisma.citizen.count({ where: { tenantId: tenant.id, isActive: true } }),
        prisma.paymentIntent.count({ where: { tenantId: tenant.id } }),
        prisma.paymentIntent.count({ where: { tenantId: tenant.id, status: 'VERIFIED' } }),
        prisma.civicAction.count({ where: { tenantId: tenant.id, status: 'REWARDED' } }),
        prisma.transparencyEntry.count({ where: { tenantId: tenant.id, transactionHash: { not: null } } })
      ]);

      return {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        cityName: tenant.cityName,
        tagline: tenant.tagline,
        primaryColor: tenant.primaryColor,
        email: tenant.email,
        phone: tenant.phone,
        isActive: tenant.isActive,
        walletStatus: tenant.stellarWalletStatus,
        walletConfigured: Boolean(tenant.stellarReceivingPublicKey),
        createdAt: tenant.createdAt.toISOString(),
        stats: { reports, services, staff, citizens, payments, verifiedPayments, rewards, disbursements }
      };
    })
  );
}

export type CreateTenantInput = {
  slug?: string;
  name?: string;
  cityName?: string;
  tagline?: string;
  description?: string;
  primaryColor?: string;
  email?: string;
  phone?: string;
  address?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  seedDefaults?: boolean;
};

export async function createTenant(input: CreateTenantInput) {
  const slug = normalizeSlug(input.slug || input.name || '');
  const name = String(input.name || '').trim();
  const cityName = String(input.cityName || '').trim();
  const adminEmail = normalizeEmail(input.adminEmail || '');
  const adminPassword = String(input.adminPassword || '');

  if (!slug) throw new Error('A URL slug is required (letters, numbers, and hyphens).');
  if (!name) throw new Error('Organization name is required.');
  if (!cityName) throw new Error('City / locality name is required.');
  if (!adminEmail) throw new Error('An initial admin email is required.');
  if (adminPassword.length < 8) throw new Error('The admin password must be at least 8 characters.');

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) throw new Error(`The slug "${slug}" is already taken. Choose another.`);

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const seedDefaults = input.seedDefaults !== false;

  const tenant = await prisma.tenant.create({
    data: {
      slug,
      name,
      cityName,
      tagline: String(input.tagline || '').trim() || `${cityName} citizen services`,
      description: String(input.description || '').trim() || `Report concerns, pay verifiable fees, and follow public records for ${cityName}.`,
      primaryColor: String(input.primaryColor || '').trim() || '#1a497b',
      email: String(input.email || '').trim() || null,
      phone: String(input.phone || '').trim() || null,
      address: String(input.address || '').trim() || null,
      isActive: true,
      users: {
        create: {
          name: String(input.adminName || '').trim() || 'Operations Administrator',
          email: adminEmail,
          passwordHash,
          role: 'ADMIN',
          isActive: true
        }
      },
      ...(seedDefaults
        ? {
            categories: { create: DEFAULT_CATEGORIES.map((category) => ({ ...category, isActive: true })) },
            departments: { create: DEFAULT_DEPARTMENTS.map((department) => ({ ...department, isActive: true })) }
          }
        : {})
    }
  });

  return { id: tenant.id, slug: tenant.slug, name: tenant.name, adminEmail };
}

export type UpdateTenantInput = {
  name?: string;
  cityName?: string;
  tagline?: string;
  description?: string;
  primaryColor?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
};

export async function updateTenant(id: string, input: UpdateTenantInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new Error('Tenant not found.');

  return prisma.tenant.update({
    where: { id },
    data: {
      name: input.name != null ? String(input.name).trim() || tenant.name : tenant.name,
      cityName: input.cityName != null ? String(input.cityName).trim() || tenant.cityName : tenant.cityName,
      tagline: input.tagline != null ? String(input.tagline).trim() || tenant.tagline : tenant.tagline,
      description: input.description != null ? String(input.description).trim() || tenant.description : tenant.description,
      primaryColor: input.primaryColor != null ? String(input.primaryColor).trim() || tenant.primaryColor : tenant.primaryColor,
      email: input.email != null ? String(input.email).trim() || null : tenant.email,
      phone: input.phone != null ? String(input.phone).trim() || null : tenant.phone,
      address: input.address != null ? String(input.address).trim() || null : tenant.address,
      isActive: typeof input.isActive === 'boolean' ? input.isActive : tenant.isActive
    }
  });
}

/** Reset an existing tenant admin's password, or create the admin if missing. */
export async function resetTenantAdmin(tenantId: string, input: { name?: string; email?: string; password?: string }) {
  const email = normalizeEmail(input.email || '');
  const password = String(input.password || '');

  if (!email) throw new Error('Admin email is required.');
  if (password.length < 8) throw new Error('The admin password must be at least 8 characters.');

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error('Tenant not found.');

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId, email } },
    update: { passwordHash, role: 'ADMIN', isActive: true, name: String(input.name || '').trim() || 'Operations Administrator' },
    create: { tenantId, email, passwordHash, role: 'ADMIN', isActive: true, name: String(input.name || '').trim() || 'Operations Administrator' }
  });

  return { email };
}
