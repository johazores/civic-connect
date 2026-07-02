export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_32px_rgba(16,32,51,0.06)]">
      <p className="text-sm font-black text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-900">{value}</p>
    </div>
  );
}
