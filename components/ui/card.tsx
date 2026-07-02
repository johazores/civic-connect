import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.04] md:p-6 ${className}`}>{children}</div>;
}
