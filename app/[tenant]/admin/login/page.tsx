import { notFound } from 'next/navigation';
import { FiShield } from 'react-icons/fi';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function AdminLoginPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <main className="civic-device-shell">
      <div className="civic-app-frame">
        <div className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">{tenant.name.slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="app-title truncate">Staff access</p>
              <p className="app-subtitle truncate">{tenant.name} operations</p>
            </div>
          </div>
          <span className="app-icon-btn"><FiShield className="h-4 w-4" /></span>
        </div>
        <div className="civic-viewport px-4 pb-6 pt-4">
          <section className="app-pulse-card p-5">
            <div className="relative z-10">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-blue-100">Operations portal</p>
              <h1 className="mt-3 font-display text-[2.05rem] font-black leading-[1.02] tracking-[-0.055em] text-white">Welcome back</h1>
              <p className="mt-4 text-sm font-semibold leading-6 text-blue-100/90">Manage citizen reports, service content, Stellar wallets, payments, rewards, and public records.</p>
            </div>
          </section>
          <div className="mt-5">
            <AdminLoginForm tenantSlug={tenant.slug} />
          </div>
        </div>
      </div>
    </main>
  );
}
