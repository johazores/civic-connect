import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  const pad = /(^|\s)p[trblxy]?-/.test(className) ? '' : 'p-5';
  return <div className={`card ${pad} ${className}`.trim()}>{children}</div>;
}
