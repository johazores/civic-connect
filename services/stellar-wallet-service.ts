import { prisma } from '@/lib/db';
import {
  encryptStellarSecret,
  fetchHorizonAccount,
  fundTestnetAccount,
  generateStellarKeypair,
  isValidStellarPublicKey,
  isValidStellarSecretKey,
  publicKeyFromSecret,
  resolveStellarNetworkConfig
} from '@/lib/stellar/index';

export type PublicTenantStellarWallet = {
  tenantId: string;
  network: string;
  networkPassphrase: string;
  horizonUrl: string;
  friendbotUrl: string | null;
  receivingPublicKey: string | null;
  hasStoredSecret: boolean;
  status: string;
  balances: Array<{ assetType: string; assetCode: string; balance: string }>;
  lastCheckedAt: string | null;
  lastFundedAt: string | null;
  error: string | null;
};

async function getTenantBySlugForWallet(tenantSlug: string) {
  const tenant = await prisma.tenant.findFirst({ where: { slug: tenantSlug, isActive: true } });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return tenant;
}

export async function getTenantStellarWallet(tenantSlug: string): Promise<PublicTenantStellarWallet> {
  const tenant = await getTenantBySlugForWallet(tenantSlug);
  const config = resolveStellarNetworkConfig({
    network: tenant.stellarNetwork,
    horizonUrl: tenant.stellarHorizonUrl,
    friendbotUrl: tenant.stellarFriendbotUrl,
    networkPassphrase: tenant.stellarNetworkPassphrase
  });

  let balances: PublicTenantStellarWallet['balances'] = [];
  let status = tenant.stellarWalletStatus;
  let error = tenant.stellarWalletError;

  if (tenant.stellarReceivingPublicKey) {
    try {
      const account = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey: tenant.stellarReceivingPublicKey });
      balances = account.balances;
      status = account.exists ? (tenant.stellarWalletStatus === 'GENERATED' || tenant.stellarWalletStatus === 'IMPORTED' ? 'FUNDED' : tenant.stellarWalletStatus) : tenant.stellarWalletStatus;
      error = account.exists ? null : account.failureReason || tenant.stellarWalletError;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to check Stellar wallet.';
    }
  }

  return {
    tenantId: tenant.id,
    network: config.network,
    networkPassphrase: config.networkPassphrase,
    horizonUrl: config.horizonUrl,
    friendbotUrl: config.friendbotUrl || null,
    receivingPublicKey: tenant.stellarReceivingPublicKey,
    hasStoredSecret: Boolean(tenant.stellarReceivingSecretEncrypted),
    status,
    balances,
    lastCheckedAt: tenant.stellarWalletLastCheckedAt?.toISOString() || null,
    lastFundedAt: tenant.stellarWalletLastFundedAt?.toISOString() || null,
    error
  };
}

export async function generateTenantTestnetWallet(tenantSlug: string, shouldFund = true) {
  const tenant = await getTenantBySlugForWallet(tenantSlug);
  const config = resolveStellarNetworkConfig({ network: 'TESTNET', horizonUrl: tenant.stellarHorizonUrl, friendbotUrl: tenant.stellarFriendbotUrl });
  const keypair = generateStellarKeypair();
  const encryptedSecret = encryptStellarSecret(keypair.secretKey);

  let status: 'GENERATED' | 'FUNDED' | 'ERROR' = 'GENERATED';
  let error: string | null = null;
  let fundedAt: Date | null = null;

  if (shouldFund) {
    try {
      await fundTestnetAccount({ friendbotUrl: config.friendbotUrl || 'https://friendbot.stellar.org', publicKey: keypair.publicKey });
      status = 'FUNDED';
      fundedAt = new Date();
    } catch (err) {
      status = 'ERROR';
      error = err instanceof Error ? err.message : 'Friendbot could not fund the generated Testnet wallet.';
    }
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stellarReceivingPublicKey: keypair.publicKey,
      stellarReceivingSecretEncrypted: encryptedSecret,
      stellarNetwork: 'TESTNET',
      stellarNetworkPassphrase: config.networkPassphrase,
      stellarHorizonUrl: config.horizonUrl,
      stellarFriendbotUrl: config.friendbotUrl || 'https://friendbot.stellar.org',
      stellarWalletStatus: status,
      stellarWalletLastFundedAt: fundedAt,
      stellarWalletLastCheckedAt: new Date(),
      stellarWalletError: error
    }
  });

  return getTenantStellarWallet(tenantSlug);
}

export async function importTenantStellarWallet(input: { tenantSlug: string; publicKey?: string | null; secretKey?: string | null; network?: string | null; horizonUrl?: string | null; friendbotUrl?: string | null; networkPassphrase?: string | null }) {
  const tenant = await getTenantBySlugForWallet(input.tenantSlug);
  const config = resolveStellarNetworkConfig(input);
  const secretKey = input.secretKey?.trim();
  const publicKey = input.publicKey?.trim();

  let nextPublicKey = publicKey || tenant.stellarReceivingPublicKey;
  let encryptedSecret: string | undefined;
  let status: 'NOT_CONFIGURED' | 'IMPORTED' = nextPublicKey ? 'IMPORTED' : 'NOT_CONFIGURED';

  if (secretKey) {
    if (!isValidStellarSecretKey(secretKey)) {
      throw new Error('The Stellar secret key is invalid. It must be a valid S... secret seed.');
    }

    nextPublicKey = publicKeyFromSecret(secretKey);
    encryptedSecret = encryptStellarSecret(secretKey);
    status = 'IMPORTED';
  }

  if (nextPublicKey && !isValidStellarPublicKey(nextPublicKey)) {
    throw new Error('The Stellar public key is invalid. It must be a valid G... account address.');
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stellarReceivingPublicKey: nextPublicKey || null,
      ...(encryptedSecret ? { stellarReceivingSecretEncrypted: encryptedSecret } : {}),
      stellarNetwork: config.network,
      stellarNetworkPassphrase: config.networkPassphrase,
      stellarHorizonUrl: config.horizonUrl,
      stellarFriendbotUrl: config.friendbotUrl || tenant.stellarFriendbotUrl,
      stellarWalletStatus: status,
      stellarWalletLastCheckedAt: new Date(),
      stellarWalletError: null
    }
  });

  return getTenantStellarWallet(input.tenantSlug);
}

export async function fundTenantTestnetWallet(tenantSlug: string) {
  const tenant = await getTenantBySlugForWallet(tenantSlug);

  if (tenant.stellarNetwork !== 'TESTNET') {
    throw new Error('Friendbot funding is only available on Stellar Testnet.');
  }

  if (!tenant.stellarReceivingPublicKey || !isValidStellarPublicKey(tenant.stellarReceivingPublicKey)) {
    throw new Error('Configure a valid Stellar Testnet receiving public key first.');
  }

  const config = resolveStellarNetworkConfig({
    network: tenant.stellarNetwork,
    horizonUrl: tenant.stellarHorizonUrl,
    friendbotUrl: tenant.stellarFriendbotUrl,
    networkPassphrase: tenant.stellarNetworkPassphrase
  });

  try {
    await fundTestnetAccount({ friendbotUrl: config.friendbotUrl || 'https://friendbot.stellar.org', publicKey: tenant.stellarReceivingPublicKey });
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        stellarWalletStatus: 'FUNDED',
        stellarWalletLastFundedAt: new Date(),
        stellarWalletLastCheckedAt: new Date(),
        stellarWalletError: null
      }
    });
  } catch (err) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        stellarWalletStatus: 'ERROR',
        stellarWalletLastCheckedAt: new Date(),
        stellarWalletError: err instanceof Error ? err.message : 'Friendbot could not fund the wallet.'
      }
    });
    throw err;
  }

  return getTenantStellarWallet(tenantSlug);
}

export async function checkTenantStellarWallet(tenantSlug: string) {
  const tenant = await getTenantBySlugForWallet(tenantSlug);

  if (!tenant.stellarReceivingPublicKey || !isValidStellarPublicKey(tenant.stellarReceivingPublicKey)) {
    throw new Error('Configure a valid Stellar receiving wallet before checking status.');
  }

  const config = resolveStellarNetworkConfig({
    network: tenant.stellarNetwork,
    horizonUrl: tenant.stellarHorizonUrl,
    friendbotUrl: tenant.stellarFriendbotUrl,
    networkPassphrase: tenant.stellarNetworkPassphrase
  });

  const account = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey: tenant.stellarReceivingPublicKey });

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stellarWalletStatus: account.exists ? 'ACTIVE' : 'ERROR',
      stellarWalletLastCheckedAt: new Date(),
      stellarWalletError: account.exists ? null : account.failureReason || 'Wallet was not found on Horizon.'
    }
  });

  return getTenantStellarWallet(tenantSlug);
}

export async function sponsorMemberReserve(tenantSlug: string) {
  const tenant = await getTenantBySlugForWallet(tenantSlug);

  if (tenant.stellarNetwork !== 'TESTNET') {
    throw new Error('Sponsored reserve onboarding is only enabled on Stellar Testnet.');
  }

  if (!tenant.stellarReceivingSecretEncrypted) {
    throw new Error('Configure and store the organization wallet secret before sponsoring member reserves.');
  }

  const { decryptStellarSecret } = await import('@/lib/stellar/secure-secret');
  const { sponsorNewMemberAccount } = await import('@/lib/stellar/sponsor-reserve');
  const config = resolveStellarNetworkConfig({
    network: tenant.stellarNetwork,
    horizonUrl: tenant.stellarHorizonUrl,
    friendbotUrl: tenant.stellarFriendbotUrl,
    networkPassphrase: tenant.stellarNetworkPassphrase
  });

  const sponsorSecret = decryptStellarSecret(tenant.stellarReceivingSecretEncrypted);
  const sponsored = await sponsorNewMemberAccount({
    sponsorSecretKey: sponsorSecret,
    horizonUrl: config.horizonUrl,
    networkPassphrase: config.networkPassphrase
  });

  return {
    publicKey: sponsored.publicKey,
    secretKey: sponsored.secretKey,
    transactionHash: sponsored.transactionHash,
    ledger: sponsored.ledger,
    network: config.network,
    note: 'Testnet learning wallet only. Share the public key with the member; keep the secret key private until they import it into Freighter.'
  };
}
