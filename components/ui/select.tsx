import type { SelectHTMLAttributes } from 'react';

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus-premium ${className}`}
      {...props}
    />
  );
}
