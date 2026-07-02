import { formatStatus } from '@/lib/format';

const styles: Record<string, string> = {
  SUBMITTED: 'bg-sky-50 text-sky-800 ring-sky-200',
  REVIEWING: 'bg-amber-50 text-amber-800 ring-amber-200',
  ASSIGNED: 'bg-blue-50 text-blue-800 ring-blue-200',
  IN_PROGRESS: 'bg-cyan-50 text-cyan-800 ring-cyan-200',
  RESOLVED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-800 ring-rose-200',
  LOW: 'bg-slate-50 text-slate-700 ring-slate-200',
  NORMAL: 'bg-blue-50 text-blue-800 ring-blue-200',
  HIGH: 'bg-amber-50 text-amber-800 ring-amber-200',
  URGENT: 'bg-rose-50 text-rose-800 ring-rose-200'
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[value] || 'bg-slate-50 text-slate-700 ring-slate-200'}`}>
      {formatStatus(value)}
    </span>
  );
}
