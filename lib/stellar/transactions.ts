import { Asset, BASE_FEE, Horizon, Keypair, Memo, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { normalizeStellarAmount } from './utils';

export type SubmitStellarPaymentInput = {
  sourceSecretKey: string;
  destinationPublicKey: string;
  amount: string | number;
  assetCode?: string | null;
  assetIssuer?: string | null;
  memo: string;
  horizonUrl: string;
  networkPassphrase: string;
};

export type SubmittedStellarPayment = {
  transactionHash: string;
  ledger?: number;
  operationCount?: number;
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
    .addMemo(Memo.text(safeMemo(input.memo)))
    .setTimeout(180)
    .build();

  transaction.sign(sourceKeypair);

  const result = await server.submitTransaction(transaction);

  return {
    transactionHash: result.hash,
    ledger: typeof result.ledger === 'number' ? result.ledger : undefined
  };
}
