import { formatStatus } from '@/lib/format';

const styles: Record<string, string> = {
  SUBMITTED: 'bg-[color-mix(in_srgb,var(--heat-0)_12%,var(--surface))] text-[var(--heat-0)]',
  REVIEWING: 'bg-[color-mix(in_srgb,var(--heat-2)_18%,var(--surface))] text-[#9a6b00]',
  ASSIGNED: 'bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]',
  IN_PROGRESS: 'bg-[color-mix(in_srgb,var(--heat-3)_18%,var(--surface))] text-[#a45a13]',
  RESOLVED: 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]',
  REJECTED: 'bg-[var(--ember-soft)] text-[var(--ember-600)]',
  LOW: 'bg-[var(--surface-2)] text-[var(--muted)]',
  NORMAL: 'bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]',
  HIGH: 'bg-[color-mix(in_srgb,var(--heat-3)_18%,var(--surface))] text-[#a45a13]',
  URGENT: 'bg-[var(--ember-soft)] text-[var(--ember-600)]'
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={`status-pill max-w-full whitespace-nowrap ${styles[value] || 'bg-[var(--surface-2)] text-[var(--ink-2)]'}`}>
      {formatStatus(value)}
    </span>
  );
}
