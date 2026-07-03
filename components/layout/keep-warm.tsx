'use client';

import { useEffect } from 'react';

/**
 * Pings /api/health on an interval to keep the serverless Postgres connection
 * warm during a live demo, so the first real request never hits a cold start.
 */
export function KeepWarm({ intervalMs = 240000 }: { intervalMs?: number }) {
  useEffect(() => {
    const ping = () => {
      fetch('/api/health', { cache: 'no-store' }).catch(() => {});
    };

    ping();
    const timer = window.setInterval(ping, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return null;
}
