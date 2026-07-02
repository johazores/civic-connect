import { notFound } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function AdminLoginPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-12 text-slate-950 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="section-eyebrow">{tenant.name}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">Welcome back</h1>
          <p className="mt-4 text-base font-medium leading-7 text-slate-600">Manage reports, content, and tenant settings.</p>
        </div>
        <AdminLoginForm tenantSlug={tenant.slug} />
      </div>
    </main>
  );
}
