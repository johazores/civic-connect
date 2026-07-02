import { assetMatches, amountsMatch, isValidStellarTransactionHash } from './utils';
import { getAccountTransactions, getTransactionByHash, getTransactionOperations, type HorizonPaymentOperation, type HorizonTransaction } from './horizon';

export type HorizonVerificationInput = {
  horizonUrl?: string | null;
  transactionHash?: string | null;
  destinationPublicKey: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string | null;
  memo: string;
};

export type HorizonVerificationResult = {
  verified: boolean;
  transactionHash?: string;
  paymentOperationId?: string;
  payerPublicKey?: string;
  ledger?: number;
  paidAt?: string;
  transactionFound?: boolean;
  transactionSuccessful?: boolean;
  failureReason?: string;
};

function findMatchingPayment(records: HorizonPaymentOperation[], input: HorizonVerificationInput) {
  return records.find((operation) => {
    return (
      operation.type === 'payment' &&
      operation.to === input.destinationPublicKey &&
      amountsMatch(String(operation.amount || '0'), input.amount) &&
      assetMatches(operation, input.assetCode, input.assetIssuer)
    );
  });
}

async function inspectTransaction(transaction: HorizonTransaction, input: HorizonVerificationInput): Promise<HorizonVerificationResult> {
  if (transaction.successful === false) {
    return {
      verified: false,
      transactionFound: true,
      transactionSuccessful: false,
      failureReason: 'The Stellar transaction exists but was not successful.'
    };
  }

  if (String(transaction.memo || '') !== input.memo) {
    return {
      verified: false,
      transactionFound: true,
      transactionSuccessful: true,
      failureReason: 'Transaction memo does not match this payment intent.'
    };
  }

  const operations = await getTransactionOperations({ horizonUrl: input.horizonUrl || '', transactionHash: transaction.hash });
  const payment = findMatchingPayment(operations, input);

  if (!payment) {
    return {
      verified: false,
      transactionFound: true,
      transactionSuccessful: true,
      failureReason: 'No matching payment operation was found for the expected destination, amount, and asset.'
    };
  }

  return {
    verified: true,
    transactionFound: true,
    transactionSuccessful: true,
    transactionHash: transaction.hash,
    paymentOperationId: payment.id,
    payerPublicKey: payment.from,
    ledger: Number(transaction.ledger),
    paidAt: transaction.created_at || payment.created_at
  };
}

export async function verifyStellarPaymentByHash(input: HorizonVerificationInput): Promise<HorizonVerificationResult> {
  const hash = String(input.transactionHash || '').trim();

  if (!isValidStellarTransactionHash(hash)) {
    return { verified: false, failureReason: 'Transaction hash must be a 64-character hexadecimal Stellar transaction hash.' };
  }

  const transaction = await getTransactionByHash({ horizonUrl: input.horizonUrl || '', transactionHash: hash });

  if (!transaction) {
    return { verified: false, transactionFound: false, failureReason: 'Transaction was not found on the configured Stellar Horizon endpoint.' };
  }

  return inspectTransaction(transaction, { ...input, transactionHash: hash });
}

export async function findAndVerifyStellarPayment(input: HorizonVerificationInput): Promise<HorizonVerificationResult> {
  const transactions = await getAccountTransactions({ horizonUrl: input.horizonUrl || '', publicKey: input.destinationPublicKey, limit: 200 });
  const candidates = transactions.filter((transaction) => String(transaction.memo || '') === input.memo);

  for (const transaction of candidates) {
    const result = await inspectTransaction(transaction, input);

    if (result.verified || result.transactionFound) {
      return result;
    }
  }

  return {
    verified: false,
    transactionFound: false,
    failureReason: 'No matching payment has been found yet. Confirm the wallet submitted the transaction on the selected Stellar network.'
  };
}
