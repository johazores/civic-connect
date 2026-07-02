import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default async function AdminPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  return <AdminDashboard tenantSlug={tenantSlug} />;
}
