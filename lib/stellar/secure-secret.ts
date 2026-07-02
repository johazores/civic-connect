import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const prefix = 'v1';

function getEncryptionKey() {
  const raw = process.env.STELLAR_WALLET_ENCRYPTION_KEY || process.env.ADMIN_JWT_SECRET;

  if (!raw || raw.length < 24) {
    throw new Error('STELLAR_WALLET_ENCRYPTION_KEY must be set to a long random value before storing Stellar wallet secrets.');
  }

  const base64 = Buffer.from(raw, 'base64');

  if (base64.length === 32) {
    return base64;
  }

  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptStellarSecret(secretKey: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secretKey, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [prefix, iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptStellarSecret(encryptedSecret: string) {
  const [version, iv, authTag, encrypted] = encryptedSecret.split(':');

  if (version !== prefix || !iv || !authTag || !encrypted) {
    throw new Error('Stored Stellar secret uses an unsupported encryption format.');
  }

  const decipher = crypto.createDecipheriv(algorithm, getEncryptionKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8');
}
