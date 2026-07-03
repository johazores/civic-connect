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
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.10)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-3xl">{value}</p>
          <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        </div>
        {icon ? <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">{icon}</div> : null}
      </div>
      {note ? <p className="mt-3 text-xs font-medium leading-5 text-slate-500">{note}</p> : null}
    </div>
  );
}
