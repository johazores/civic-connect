import { BASE_FEE, Horizon, Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { generateStellarKeypair } from './keys';

export type SponsoredMemberAccount = {
  publicKey: string;
  secretKey: string;
  transactionHash: string;
  ledger?: number;
};

/**
 * Sponsor base reserve for a new member account so they can start with zero XLM balance.
 * Testnet-friendly onboarding for NGOs and community orgs (#31 Sponsored Reserve Onboarding Kit).
 */
export async function sponsorNewMemberAccount(input: {
  sponsorSecretKey: string;
  horizonUrl: string;
  networkPassphrase: string;
}): Promise<SponsoredMemberAccount> {
  const server = new Horizon.Server(input.horizonUrl);
  const sponsorKeypair = Keypair.fromSecret(input.sponsorSecretKey.trim());
  const memberKeys = generateStellarKeypair();
  const memberKeypair = Keypair.fromSecret(memberKeys.secretKey);
  const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

  const transaction = new TransactionBuilder(sponsorAccount, {
    fee: BASE_FEE,
    networkPassphrase: input.networkPassphrase
  })
    .addOperation(Operation.beginSponsoringFutureReserves({ sponsoredId: memberKeypair.publicKey() }))
    .addOperation(
      Operation.createAccount({
        destination: memberKeypair.publicKey(),
        startingBalance: '0'
      })
    )
    .setTimeout(180)
    .build();

  transaction.sign(sponsorKeypair);
  transaction.sign(memberKeypair);

  const result = await server.submitTransaction(transaction);

  return {
    publicKey: memberKeys.publicKey,
    secretKey: memberKeys.secretKey,
    transactionHash: result.hash,
    ledger: typeof result.ledger === 'number' ? result.ledger : undefined
  };
}
