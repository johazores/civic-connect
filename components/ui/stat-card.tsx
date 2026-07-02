export function StatCard({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
      <p className="text-3xl font-extrabold tracking-[-0.035em] text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      {note ? <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p> : null}
    </div>
  );
}
