import { FiCheckCircle, FiClock, FiExternalLink, FiHash, FiShield } from 'react-icons/fi';
import { stellarExpertClaimableBalanceUrl, stellarExpertTxUrl } from '@/lib/stellar/explorer';

/**
 * Consistent "Verified on Stellar" proof card reused across receipts, rewards,
 * disbursements, and tax receipts. Shows the on-chain transaction hash, ledger,
 * optional proof digest, and a public explorer link anyone can open to verify.
 */
export function StellarProof({
  transactionHash,
  ledger,
  network = 'TESTNET',
  proofDigest,
  claimableBalanceId,
  compact = false
}: {
  transactionHash?: string | null;
  ledger?: number | null;
  network?: string | null;
  proofDigest?: string | null;
  claimableBalanceId?: string | null;
  compact?: boolean;
}) {
  const txUrl = stellarExpertTxUrl(transactionHash, network);
  const balanceUrl = stellarExpertClaimableBalanceUrl(claimableBalanceId, network);
  const verified = Boolean(transactionHash);
  const networkLabel = String(network || 'TESTNET').toUpperCase() === 'MAINNET' ? 'Stellar' : 'Stellar Testnet';

  return (
    <div className={`rounded-[18px] border p-4 ${verified ? 'border-[color-mix(in_srgb,var(--heat-1)_26%,transparent)] bg-[color-mix(in_srgb,var(--heat-1)_9%,var(--surface))]' : 'border-[var(--line)] bg-[var(--surface-2)]'}`}>
      <div className="flex items-center gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-full ${verified ? 'bg-[color-mix(in_srgb,var(--heat-1)_18%,var(--surface))] text-[#0f806d]' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
          {verified ? <FiCheckCircle aria-hidden="true" className="h-4 w-4" /> : <FiClock aria-hidden="true" className="h-4 w-4" />}
        </span>
        <p className={`text-[13px] font-extrabold ${verified ? 'text-[#0f806d]' : 'text-[var(--muted)]'}`}>
          {verified ? `Verified on ${networkLabel}` : 'Awaiting on-chain confirmation'}
        </p>
        {claimableBalanceId ? (
          <span className="status-pill ml-auto bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]">Claimable</span>
        ) : null}
      </div>

      {verified ? (
        <>
          <ProofRow label="Transaction hash" value={transactionHash!} />
          {typeof ledger === 'number' && ledger > 0 ? <ProofRow label="Ledger" value={String(ledger)} /> : null}
          {!compact && proofDigest ? <ProofRow label="Proof digest (SHA-256 · on-chain memo)" value={proofDigest} icon={<FiShield className="h-3.5 w-3.5" />} /> : null}
          {claimableBalanceId ? <ProofRow label="Claimable balance ID" value={claimableBalanceId} /> : null}

          <div className="mt-3 grid gap-2">
            {txUrl ? (
              <a href={txUrl} target="_blank" rel="noreferrer" className="app-btn btn-outline btn-compact">
                <FiExternalLink aria-hidden="true" className="h-4 w-4" /> View on Stellar Expert
              </a>
            ) : null}
            {balanceUrl ? (
              <a href={balanceUrl} target="_blank" rel="noreferrer" className="app-btn btn-outline btn-compact">
                <FiExternalLink aria-hidden="true" className="h-4 w-4" /> View claimable balance
              </a>
            ) : null}
          </div>
        </>
      ) : (
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--ink-2)]">
          This record will show a permanent, publicly verifiable Stellar transaction once it is confirmed on the network.
        </p>
      )}
    </div>
  );
}

function ProofRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
        {icon || <FiHash className="h-3.5 w-3.5" />} {label}
      </p>
      <p className="mt-1 break-all font-mono text-[12.5px] font-semibold leading-relaxed text-[var(--ink)]">{value}</p>
    </div>
  );
}
