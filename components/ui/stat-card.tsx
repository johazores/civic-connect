import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  note,
  icon
}: {
  label: string;
  value: string | number;
  note?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="app-stat transition active:scale-[.985]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="app-stat-value break-words tabular-nums">{value}</p>
          <p className="app-stat-label">{label}</p>
        </div>
        {icon ? (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--surface-2)] text-[var(--navy)]">
            {icon}
          </div>
        ) : null}
      </div>
      {note ? <p className="mt-3 text-xs font-semibold leading-5 text-[var(--muted)]">{note}</p> : null}
    </div>
  );
}
