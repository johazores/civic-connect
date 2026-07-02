import { normalizeStellarAmount } from './utils';

export type Sep7PaymentInput = {
  destination: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string | null;
  memo: string;
  message: string;
  networkPassphrase?: string | null;
  callbackUrl?: string;
  originDomain?: string;
};

export function buildSep7PayUri(input: Sep7PaymentInput) {
  const params = new URLSearchParams();
  params.set('destination', input.destination);
  params.set('amount', normalizeStellarAmount(input.amount));
  params.set('memo', input.memo);
  params.set('memo_type', 'MEMO_TEXT');
  params.set('msg', input.message);

  if (input.networkPassphrase) {
    params.set('network_passphrase', input.networkPassphrase);
  }

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
