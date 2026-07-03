import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.055)] md:p-6 ${className}`}>{children}</div>;
}
