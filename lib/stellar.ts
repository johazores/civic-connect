const defaultHorizonUrl = 'https://horizon-testnet.stellar.org';

export type Sep7PaymentInput = {
  destination: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string | null;
  memo: string;
  message: string;
  callbackUrl?: string;
  originDomain?: string;
};

export type HorizonVerificationInput = {
  horizonUrl?: string | null;
  transactionHash: string;
  destinationPublicKey: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string | null;
  memo: string;
};

export type HorizonVerificationResult = {
  verified: boolean;
  transactionHash?: string;
  payerPublicKey?: string;
  ledger?: number;
  paidAt?: string;
  failureReason?: string;
};

function cleanBaseUrl(url?: string | null) {
  return (url || defaultHorizonUrl).replace(/\/$/, '');
}

export function normalizeStellarAmount(value: string | number) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '0.0000000';
  }

  return numeric.toFixed(7).replace(/0+$/, '').replace(/\.$/, '');
}

export function isValidStellarPublicKey(value?: string | null) {
  return Boolean(value && /^G[A-Z2-7]{55}$/.test(value));
}

export function buildSep7PayUri(input: Sep7PaymentInput) {
  const params = new URLSearchParams();
  params.set('destination', input.destination);
  params.set('amount', normalizeStellarAmount(input.amount));
  params.set('memo', input.memo);
  params.set('memo_type', 'MEMO_TEXT');
  params.set('msg', input.message);

  if (input.callbackUrl) {
    params.set('callback', input.callbackUrl);
  }

  if (input.originDomain) {
    params.set('origin_domain', input.originDomain);
  }

  if (input.assetCode && input.assetCode !== 'XLM') {
    params.set('asset_code', input.assetCode);

    if (input.assetIssuer) {
      params.set('asset_issuer', input.assetIssuer);
    }
  }

  return `web+stellar:pay?${params.toString()}`;
}

function amountsMatch(actual: string, expected: string) {
  return Math.abs(Number(actual) - Number(expected)) < 0.0000001;
}

function assetMatches(operation: Record<string, any>, assetCode: string, assetIssuer?: string | null) {
  if (assetCode === 'XLM') {
    return operation.asset_type === 'native';
  }

  return operation.asset_code === assetCode && (!assetIssuer || operation.asset_issuer === assetIssuer);
}

export async function verifyStellarPayment(input: HorizonVerificationInput): Promise<HorizonVerificationResult> {
  const horizonUrl = cleanBaseUrl(input.horizonUrl);
  const hash = input.transactionHash.trim();

  if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
    return { verified: false, failureReason: 'Transaction hash must be a 64-character hexadecimal Stellar transaction hash.' };
  }

  const transactionResponse = await fetch(`${horizonUrl}/transactions/${encodeURIComponent(hash)}`, {
    headers: { Accept: 'application/json' }
  });

  if (!transactionResponse.ok) {
    return { verified: false, failureReason: 'Transaction was not found on the configured Stellar Horizon Testnet endpoint.' };
  }

  const transaction = await transactionResponse.json();

  if (transaction.successful === false) {
    return { verified: false, failureReason: 'The Stellar transaction exists but was not successful.' };
  }

  if (String(transaction.memo || '') !== input.memo) {
    return { verified: false, failureReason: 'Transaction memo does not match this payment intent.' };
  }

  const operationsResponse = await fetch(`${horizonUrl}/transactions/${encodeURIComponent(hash)}/operations?limit=200`, {
    headers: { Accept: 'application/json' }
  });

  if (!operationsResponse.ok) {
    return { verified: false, failureReason: 'Unable to read transaction operations from Horizon.' };
  }

  const operationsPayload = await operationsResponse.json();
  const records = Array.isArray(operationsPayload?._embedded?.records) ? operationsPayload._embedded.records : [];
  const payment = records.find((operation: Record<string, any>) => {
    return (
      operation.type === 'payment' &&
      operation.to === input.destinationPublicKey &&
      amountsMatch(operation.amount, input.amount) &&
      assetMatches(operation, input.assetCode, input.assetIssuer)
    );
  });

  if (!payment) {
    return { verified: false, failureReason: 'No matching payment operation was found for the expected destination, amount, and asset.' };
  }

  return {
    verified: true,
    transactionHash: hash,
    payerPublicKey: payment.from,
    ledger: Number(transaction.ledger),
    paidAt: transaction.created_at
  };
}
