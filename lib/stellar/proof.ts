import { createHash } from 'crypto';

/**
 * A civic proof digest is a SHA-256 over the record's canonical, tamper-sensitive
 * fields. It is stored on the record AND anchored on the Stellar ledger as a
 * 32-byte MEMO_HASH, so anyone can recompute the digest from the public record
 * and confirm it matches the on-chain memo — without exposing private data.
 */
export function computeProofDigest(parts: Array<string | number | null | undefined>): string {
  const payload = parts.map((part) => String(part ?? '').trim()).join('|');
  return createHash('sha256').update(payload).digest('hex');
}

/** True when a string is a 64-char hex SHA-256 digest (valid MEMO_HASH payload). */
export function isValidProofDigest(value?: string | null) {
  return Boolean(value && /^[a-f0-9]{64}$/i.test(value.trim()));
}
