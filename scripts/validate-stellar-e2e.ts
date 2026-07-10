/**
 * Validates the Stellar payment flow against testnet Horizon.
 * Run: npx tsx scripts/validate-stellar-e2e.ts
 *
 * Does not require PostgreSQL. Proves: fund → pay → verify works.
 */
import { Keypair } from '@stellar/stellar-sdk';
import { defaultTestnetConfig } from '../lib/stellar/config';
import { fundTestnetAccount, fetchHorizonAccount } from '../lib/stellar/horizon';
import { buildSep7PayUri } from '../lib/stellar/sep7';
import { submitSignedStellarPayment } from '../lib/stellar/transactions';
import { verifyStellarPaymentByHash } from '../lib/stellar/verification';
import { generateStellarKeypair } from '../lib/stellar/keys';

type StepResult = { step: string; ok: boolean; detail: string };

const results: StepResult[] = [];

function record(step: string, ok: boolean, detail: string) {
  results.push({ step, ok, detail });
  const icon = ok ? '✓' : '✗';
  console.log(`${icon} ${step}: ${detail}`);
}

async function main() {
  const config = defaultTestnetConfig();
  console.log(`\nStellar E2E validation (${config.network})`);
  console.log(`Horizon: ${config.horizonUrl}\n`);

  // 1. Generate wallets
  const cityWallet = generateStellarKeypair();
  const citizenWallet = generateStellarKeypair();
  record('Generate keypairs', true, `City ${cityWallet.publicKey.slice(0, 8)}… Citizen ${citizenWallet.publicKey.slice(0, 8)}…`);

  // 2. Fund via Friendbot
  try {
    await fundTestnetAccount({ friendbotUrl: config.friendbotUrl!, publicKey: cityWallet.publicKey });
    await fundTestnetAccount({ friendbotUrl: config.friendbotUrl!, publicKey: citizenWallet.publicKey });
    record('Friendbot fund', true, 'Both accounts funded on testnet');
  } catch (err) {
    record('Friendbot fund', false, err instanceof Error ? err.message : 'Friendbot failed');
    return finish(1);
  }

  // 3. Confirm accounts exist on Horizon
  const cityAccount = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey: cityWallet.publicKey });
  const citizenAccount = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey: citizenWallet.publicKey });
  record(
    'Horizon account lookup',
    cityAccount.exists && citizenAccount.exists,
    cityAccount.exists && citizenAccount.exists ? 'Both accounts visible on Horizon' : 'Account missing after fund'
  );

  if (!cityAccount.exists || !citizenAccount.exists) {
    return finish(1);
  }

  // 4. Build SEP-7 URI (what payment-service does)
  const referenceCode = `VAL-${Date.now().toString(36).toUpperCase()}`;
  const amount = '1.0000000';
  const sep7Uri = buildSep7PayUri({
    destination: cityWallet.publicKey,
    amount,
    assetCode: 'XLM',
    memo: referenceCode,
    message: `Validation payment ${referenceCode}`,
    networkPassphrase: config.networkPassphrase
  });
  const sep7Valid = sep7Uri.startsWith('web+stellar:pay?') && sep7Uri.includes(referenceCode);
  record('SEP-7 URI', sep7Valid, sep7Valid ? `Memo=${referenceCode}` : 'Invalid URI format');

  // 5. Citizen pays city (simulates wallet signing)
  let txHash: string;
  try {
    const payment = await submitSignedStellarPayment({
      sourceSecretKey: citizenWallet.secretKey,
      destinationPublicKey: cityWallet.publicKey,
      amount,
      assetCode: 'XLM',
      memo: referenceCode,
      horizonUrl: config.horizonUrl,
      networkPassphrase: config.networkPassphrase
    });
    txHash = payment.transactionHash;
    record('Submit payment', true, `tx=${txHash.slice(0, 12)}… ledger=${payment.ledger}`);
  } catch (err) {
    record('Submit payment', false, err instanceof Error ? err.message : 'Payment submit failed');
    return finish(1);
  }

  // Brief wait for Horizon indexing
  await sleep(2000);

  // 6. Verify (what payment-service.verifyPaymentIntent does)
  const verification = await verifyStellarPaymentByHash({
    horizonUrl: config.horizonUrl,
    transactionHash: txHash,
    destinationPublicKey: cityWallet.publicKey,
    amount,
    assetCode: 'XLM',
    memo: referenceCode
  });
  record(
    'Verify payment',
    verification.verified,
    verification.verified
      ? `Payer=${verification.payerPublicKey?.slice(0, 8)}…`
      : verification.failureReason || 'Verification failed'
  );

  // 7. City sends reward back (outbound flow)
  try {
    const reward = await submitSignedStellarPayment({
      sourceSecretKey: cityWallet.secretKey,
      destinationPublicKey: citizenWallet.publicKey,
      amount: '0.5000000',
      assetCode: 'XLM',
      memo: 'RWD-TEST',
      horizonUrl: config.horizonUrl,
      networkPassphrase: config.networkPassphrase
    });
    record('Outbound reward', true, `tx=${reward.transactionHash.slice(0, 12)}…`);
  } catch (err) {
    record('Outbound reward', false, err instanceof Error ? err.message : 'Outbound payment failed');
  }

  return finish(results.every((r) => r.ok) ? 0 : 1);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function finish(code: number) {
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} steps passed\n`);
  process.exit(code);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
