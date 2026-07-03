import { Asset, BASE_FEE, Claimant, Horizon, Keypair, Memo, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { normalizeStellarAmount } from './utils';
import { getClaimableBalanceIdForTransaction } from './horizon';

export type SubmitStellarPaymentInput = {
  sourceSecretKey: string;
  destinationPublicKey: string;
  amount: string | number;
  assetCode?: string | null;
  assetIssuer?: string | null;
  memo: string;
  /** Optional 64-char hex SHA-256 digest anchored on-chain as a 32-byte MEMO_HASH. Takes precedence over `memo`. */
  memoHashHex?: string | null;
  horizonUrl: string;
  networkPassphrase: string;
};

export type SubmittedStellarPayment = {
  transactionHash: string;
  ledger?: number;
  operationCount?: number;
};

export type SubmittedClaimableBalance = SubmittedStellarPayment & {
  claimableBalanceId?: string;
};

function resolvePaymentAsset(assetCode?: string | null, assetIssuer?: string | null) {
  const code = String(assetCode || 'XLM').trim().toUpperCase();

  if (code === 'XLM') {
    return Asset.native();
  }

  if (!assetIssuer) {
    throw new Error('A non-XLM Stellar payment requires a valid asset issuer public key.');
  }

  return new Asset(code, assetIssuer.trim());
}

function safeMemo(value: string) {
  const memo = String(value || '').trim();

  if (!memo) {
    throw new Error('A Stellar payment memo is required so the civic record can be linked to the ledger transaction.');
  }

  // MEMO_TEXT can hold 28 bytes. Keep civic references short and predictable.
  return memo.length > 28 ? memo.slice(0, 28) : memo;
}

/** MEMO_HASH (32 bytes) when a valid SHA-256 proof digest is supplied, else MEMO_TEXT. */
function buildMemo(memoText: string, memoHashHex?: string | null) {
  const hex = String(memoHashHex || '').trim();

  if (/^[a-f0-9]{64}$/i.test(hex)) {
    return Memo.hash(Buffer.from(hex, 'hex'));
  }

  return Memo.text(safeMemo(memoText));
}

export async function submitSignedStellarPayment(input: SubmitStellarPaymentInput): Promise<SubmittedStellarPayment> {
  const server = new Horizon.Server(input.horizonUrl);
  const sourceKeypair = Keypair.fromSecret(input.sourceSecretKey.trim());
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  const asset = resolvePaymentAsset(input.assetCode, input.assetIssuer);
  const amount = normalizeStellarAmount(input.amount);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: input.networkPassphrase
  })
    .addOperation(
      Operation.payment({
        destination: input.destinationPublicKey.trim(),
        asset,
        amount
      })
    )
    .addMemo(buildMemo(input.memo, input.memoHashHex))
    .setTimeout(180)
    .build();

  transaction.sign(sourceKeypair);

  const result = await server.submitTransaction(transaction);

  return {
    transactionHash: result.hash,
    ledger: typeof result.ledger === 'number' ? result.ledger : undefined
  };
}

/**
 * Create a claimable balance the destination can claim later from their own wallet.
 * This lets a civic reward be committed on-chain immediately — even before the
 * citizen has funded a wallet or set up a trustline — solving the onboarding wall.
 */
export async function submitClaimableBalanceReward(input: SubmitStellarPaymentInput): Promise<SubmittedClaimableBalance> {
  const server = new Horizon.Server(input.horizonUrl);
  const sourceKeypair = Keypair.fromSecret(input.sourceSecretKey.trim());
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  const asset = resolvePaymentAsset(input.assetCode, input.assetIssuer);
  const amount = normalizeStellarAmount(input.amount);
  const claimant = new Claimant(input.destinationPublicKey.trim(), Claimant.predicateUnconditional());

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: input.networkPassphrase
  })
    .addOperation(
      Operation.createClaimableBalance({
        asset,
        amount,
        claimants: [claimant]
      })
    )
    .addMemo(buildMemo(input.memo, input.memoHashHex))
    .setTimeout(180)
    .build();

  transaction.sign(sourceKeypair);

  const result = await server.submitTransaction(transaction);
  const ledger = typeof result.ledger === 'number' ? result.ledger : undefined;

  let claimableBalanceId: string | undefined;
  try {
    claimableBalanceId = (await getClaimableBalanceIdForTransaction({ horizonUrl: input.horizonUrl, transactionHash: result.hash })) || undefined;
  } catch {
    claimableBalanceId = undefined;
  }

  return { transactionHash: result.hash, ledger, claimableBalanceId };
}
