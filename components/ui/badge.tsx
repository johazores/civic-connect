import { formatStatus } from '@/lib/format';

const styles: Record<string, string> = {
  SUBMITTED: 'bg-blue-50 text-blue-700 ring-blue-200',
  REVIEWING: 'bg-amber-50 text-amber-700 ring-amber-200',
  ASSIGNED: 'bg-violet-50 text-violet-700 ring-violet-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200'
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        styles[value] || 'bg-slate-50 text-slate-700 ring-slate-200'
      }`}
    >
      {formatStatus(value)}
    </span>
  );
}
