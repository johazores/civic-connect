import { Networks } from '@stellar/stellar-sdk';

export type StellarNetworkMode = 'TESTNET' | 'MAINNET';

export type StellarNetworkConfig = {
  network: StellarNetworkMode;
  horizonUrl: string;
  friendbotUrl?: string;
  networkPassphrase: string;
};

const defaultTestnetHorizonUrl = 'https://horizon-testnet.stellar.org';
const defaultMainnetHorizonUrl = 'https://horizon.stellar.org';
const defaultFriendbotUrl = 'https://friendbot.stellar.org';

export function cleanBaseUrl(url?: string | null) {
  return (url || '').trim().replace(/\/$/, '');
}

export function resolveStellarNetworkConfig(input?: {
  network?: string | null;
  horizonUrl?: string | null;
  friendbotUrl?: string | null;
  networkPassphrase?: string | null;
}): StellarNetworkConfig {
  const network = String(input?.network || process.env.STELLAR_NETWORK || 'TESTNET').toUpperCase() === 'MAINNET' ? 'MAINNET' : 'TESTNET';

  return {
    network,
    horizonUrl: cleanBaseUrl(input?.horizonUrl || process.env.STELLAR_HORIZON_URL || (network === 'TESTNET' ? defaultTestnetHorizonUrl : defaultMainnetHorizonUrl)),
    friendbotUrl: network === 'TESTNET' ? cleanBaseUrl(input?.friendbotUrl || process.env.STELLAR_FRIENDBOT_URL || defaultFriendbotUrl) : undefined,
    networkPassphrase: input?.networkPassphrase || process.env.STELLAR_NETWORK_PASSPHRASE || (network === 'TESTNET' ? Networks.TESTNET : Networks.PUBLIC)
  };
}

export function defaultTestnetConfig(): StellarNetworkConfig {
  return resolveStellarNetworkConfig({ network: 'TESTNET' });
}

export async function resolveStellarNetworkConfigFromRuntime(input?: {
  network?: string | null;
  horizonUrl?: string | null;
  friendbotUrl?: string | null;
  networkPassphrase?: string | null;
}): Promise<StellarNetworkConfig> {
  const { getRuntimeSettingValue } = await import('@/lib/runtime-settings');

  return resolveStellarNetworkConfig({
    network: input?.network || (await getRuntimeSettingValue('STELLAR_NETWORK')),
    horizonUrl: input?.horizonUrl || (await getRuntimeSettingValue('STELLAR_HORIZON_URL')),
    friendbotUrl: input?.friendbotUrl || (await getRuntimeSettingValue('STELLAR_FRIENDBOT_URL')),
    networkPassphrase: input?.networkPassphrase || (await getRuntimeSettingValue('STELLAR_NETWORK_PASSPHRASE'))
  });
}
