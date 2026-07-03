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
    <div className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">{tenant.name.slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="app-title truncate">Staff access</p>
              <p className="app-subtitle truncate">{tenant.name} operations</p>
            </div>
          </div>
          <span className="app-icon-btn" aria-hidden="true">
            <FiShield className="h-5 w-5" />
          </span>
        </header>

        <main
          className="civic-viewport viewport-flow px-5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 26px)' }}
        >
          <div className="pb-6 pt-7">
            <div className="grid h-[60px] w-[60px] place-items-center rounded-[18px] bg-gradient-to-br from-[var(--navy)] to-[var(--navy-900)] shadow-[0_14px_30px_rgba(26,73,123,0.35)]">
              <FiShield aria-hidden="true" className="h-7 w-7 text-[#fff]" />
            </div>
            <h1 className="mt-5 font-display text-[28px] font-bold tracking-[-0.02em] text-[var(--ink)]">Welcome back</h1>
            <p className="mt-2 text-[14.5px] font-medium leading-6 text-[var(--muted)]">
              Sign in to manage reports, payments, and content.
            </p>
          </div>

          <AdminLoginForm tenantSlug={tenant.slug} />
        </main>
      </div>
    </div>
  );
}
