import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 btn-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
