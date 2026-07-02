import { Keypair, StrKey } from '@stellar/stellar-sdk';

export type StellarKeypair = {
  publicKey: string;
  secretKey: string;
};

export function generateStellarKeypair(): StellarKeypair {
  const keypair = Keypair.random();

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret()
  };
}

export function isValidStellarPublicKey(value?: string | null) {
  return Boolean(value && StrKey.isValidEd25519PublicKey(value.trim()));
}

export function isValidStellarSecretKey(value?: string | null) {
  return Boolean(value && StrKey.isValidEd25519SecretSeed(value.trim()));
}

export function publicKeyFromSecret(secretKey: string) {
  return Keypair.fromSecret(secretKey.trim()).publicKey();
}
