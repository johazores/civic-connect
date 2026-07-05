import type { NextApiRequest } from 'next';
import { prisma } from '@/lib/db';

export const databaseManagedRuntimeKeys = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_AUTH_PROVIDER',
  'STELLAR_NETWORK',
  'STELLAR_HORIZON_URL',
  'STELLAR_FRIENDBOT_URL',
  'STELLAR_NETWORK_PASSPHRASE'
] as const;

export const bootstrapEnvironmentKeys = [
  'DATABASE_URL',
  'ADMIN_JWT_SECRET',
  'STELLAR_WALLET_ENCRYPTION_KEY'
] as const;

export type DatabaseManagedRuntimeKey = (typeof databaseManagedRuntimeKeys)[number];

type RuntimeSettingRow = {
  key: string;
  value: string;
  category: string;
  description: string | null;
  updatedAt: Date;
};

export const runtimeSettingDescriptions: Record<DatabaseManagedRuntimeKey, string> = {
  NEXT_PUBLIC_APP_URL: 'Canonical deployed app URL used for links, callbacks, and metadata.',
  NEXT_PUBLIC_AUTH_PROVIDER: 'Authentication provider flag. Keep custom until Clerk migration is active.',
  STELLAR_NETWORK: 'Default Stellar network for non-tenant playground and fallback flows.',
  STELLAR_HORIZON_URL: 'Default Stellar Horizon endpoint.',
  STELLAR_FRIENDBOT_URL: 'Default Stellar Testnet Friendbot endpoint.',
  STELLAR_NETWORK_PASSPHRASE: 'Default Stellar network passphrase.'
};

export const runtimeSettingDefaults: Record<DatabaseManagedRuntimeKey, string> = {
  NEXT_PUBLIC_APP_URL: '',
  NEXT_PUBLIC_AUTH_PROVIDER: 'custom',
  STELLAR_NETWORK: 'TESTNET',
  STELLAR_HORIZON_URL: 'https://horizon-testnet.stellar.org',
  STELLAR_FRIENDBOT_URL: 'https://friendbot.stellar.org',
  STELLAR_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015'
};

export function isDatabaseManagedRuntimeKey(value: string): value is DatabaseManagedRuntimeKey {
  return databaseManagedRuntimeKeys.includes(value as DatabaseManagedRuntimeKey);
}

export async function getRuntimeSettingValue(key: DatabaseManagedRuntimeKey, fallback = '') {
  try {
    const setting = await prisma.runtimeSetting.findUnique({ where: { key } });
    const databaseValue = setting?.value?.trim();

    if (databaseValue) {
      return databaseValue;
    }
  } catch {
    // During early boot or migrations, env/default fallback keeps the app usable.
  }

  return fallback || process.env[key] || runtimeSettingDefaults[key] || '';
}

export async function listRuntimeSettings() {
  const rows = (await prisma.runtimeSetting.findMany({
    where: { key: { in: [...databaseManagedRuntimeKeys] } },
    orderBy: { key: 'asc' }
  })) as RuntimeSettingRow[];
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return databaseManagedRuntimeKeys.map((key) => {
    const row = byKey.get(key);
    const envValue = process.env[key] || '';
    const defaultValue = runtimeSettingDefaults[key] || '';

    return {
      key,
      value: row?.value || envValue || defaultValue,
      databaseValue: row?.value || '',
      envValue,
      defaultValue,
      category: row?.category || inferRuntimeSettingCategory(key),
      description: row?.description || runtimeSettingDescriptions[key],
      source: row?.value ? 'database' : envValue ? 'environment' : 'default',
      updatedAt: row?.updatedAt?.toISOString() || null
    };
  });
}

export async function upsertRuntimeSettings(settings: Partial<Record<DatabaseManagedRuntimeKey, string>>) {
  const entries = Object.entries(settings).filter(([key]) => isDatabaseManagedRuntimeKey(key)) as Array<[DatabaseManagedRuntimeKey, string]>;

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.runtimeSetting.upsert({
        where: { key },
        update: {
          value: String(value || '').trim(),
          category: inferRuntimeSettingCategory(key),
          description: runtimeSettingDescriptions[key]
        },
        create: {
          key,
          value: String(value || '').trim(),
          category: inferRuntimeSettingCategory(key),
          description: runtimeSettingDescriptions[key]
        }
      })
    )
  );

  return listRuntimeSettings();
}

export function inferRuntimeSettingCategory(key: string) {
  if (key.startsWith('STELLAR_')) return 'STELLAR';
  if (key.includes('AUTH')) return 'AUTH';
  return 'APP';
}

export async function resolveAppBaseUrl(req?: NextApiRequest) {
  const configured = await getRuntimeSettingValue('NEXT_PUBLIC_APP_URL');

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (!req) {
    return '';
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'http';
  const host = req.headers.host;

  return host ? `${protocol}://${host}` : '';
}
