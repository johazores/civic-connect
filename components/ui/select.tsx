import type { SelectHTMLAttributes } from 'react';

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus-premium ${className}`}
      {...props}
    />
  );
}
