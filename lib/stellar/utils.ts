export function normalizeStellarAmount(value: string | number) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '0.0000000';
  }

  return numeric.toFixed(7).replace(/0+$/, '').replace(/\.$/, '');
}

export function amountsMatch(actual: string, expected: string) {
  return Math.abs(Number(actual) - Number(expected)) < 0.0000001;
}

export function assetMatches(operation: Record<string, any>, assetCode: string, assetIssuer?: string | null) {
  if (assetCode === 'XLM') {
    return operation.asset_type === 'native';
  }

  return operation.asset_code === assetCode && (!assetIssuer || operation.asset_issuer === assetIssuer);
}

export function isValidStellarTransactionHash(value?: string | null) {
  return Boolean(value && /^[a-fA-F0-9]{64}$/.test(value.trim()));
}
