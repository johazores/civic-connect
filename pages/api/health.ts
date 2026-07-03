import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

/**
 * Lightweight health + keep-warm endpoint. Point an uptime pinger (or the demo
 * heartbeat) at this to keep the serverless Postgres connection warm so the
 * first real request on stage never hits a cold-connection error.
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: 'ok', db: 'up' });
  } catch {
    return res.status(503).json({ status: 'degraded', db: 'down' });
  }
}
