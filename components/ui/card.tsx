import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl p-5 md:p-6 premium-card ${className}`}>{children}</div>;
}
