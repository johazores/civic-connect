export function StatCard({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(18,32,51,0.06)]">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-blue-50" />
      <div className="relative">
        <p className="text-3xl font-black tracking-[-0.045em] text-slate-950">{value}</p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.11em] text-slate-500">{label}</p>
        {note ? <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{note}</p> : null}
      </div>
    </div>
  );
}
