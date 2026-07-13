'use client';

import { FiAward, FiCheckCircle, FiDownload, FiHash } from 'react-icons/fi';
import { Card } from '@/components/ui/card';
import { StellarProof } from '@/components/stellar/stellar-proof';
import { formatDate } from '@/lib/format';

export type VolunteerCredentialData = {
  id: string;
  type: string;
  title: string;
  description: string;
  locationText: string;
  participantName: string;
  participantEmail: string | null;
  status: string;
  rewardAmount: string;
  rewardAssetCode: string;
  rewardMemo: string | null;
  rewardTransactionHash: string | null;
  rewardLedger: number | null;
  rewardPaidAt: string | null;
  beneficiaryConfirmedAt: string | null;
  proofDigest: string | null;
  reviewedAt: string | null;
  tenantName: string;
};

export function VolunteerCredential({ tenantSlug, credential }: { tenantSlug: string; credential: VolunteerCredentialData }) {
  function printCredential() {
    window.print();
  }

  const isVerified = credential.status === 'REWARDED' && Boolean(credential.rewardTransactionHash);

  return (
    <div className="grid gap-4 print:gap-2">
      <Card className="print:border-0 print:shadow-none">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Verified activity credential</p>
        <h1 className="mt-2 font-display text-[22px] font-bold text-[var(--ink)]">{credential.title}</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">{credential.description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[14px] bg-[var(--surface-2)] p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Participant</p>
            <p className="mt-1 text-sm font-bold text-[var(--ink)]">{credential.participantName}</p>
            {credential.participantEmail ? <p className="mt-1 text-xs font-medium text-[var(--muted)]">{credential.participantEmail}</p> : null}
          </div>
          <div className="rounded-[14px] bg-[var(--surface-2)] p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Organization</p>
            <p className="mt-1 text-sm font-bold text-[var(--ink)]">{credential.tenantName}</p>
            <p className="mt-1 text-xs font-medium text-[var(--muted)]">{credential.locationText}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="status-pill bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]">
            {credential.type === 'VOLUNTEER' ? 'Volunteer hours' : credential.type.replaceAll('_', ' ')}
          </span>
          {credential.beneficiaryConfirmedAt ? (
            <span className="status-pill bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]">
              Impact confirmed
            </span>
          ) : null}
        </div>

        {isVerified ? (
          <div className="mt-5 rounded-[16px] border border-[var(--line)] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[#0f806d]">
              <FiCheckCircle aria-hidden="true" className="h-4 w-4" /> On-chain reward proof attached
            </p>
            <p className="mt-2 text-xs font-medium text-[var(--muted)]">
              Rewarded {credential.rewardPaidAt ? formatDate(credential.rewardPaidAt) : 'recently'} · {credential.rewardAmount} {credential.rewardAssetCode}
            </p>
            <div className="mt-4">
              <StellarProof
                transactionHash={credential.rewardTransactionHash}
                ledger={credential.rewardLedger}
                proofDigest={credential.proofDigest}
                network="TESTNET"
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[16px] bg-[var(--surface-2)] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
              <FiAward aria-hidden="true" className="h-4 w-4" /> Submitted — pending staff verification
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-2 print:hidden">
          <button type="button" onClick={printCredential} className="app-btn btn-primary">
            <FiDownload aria-hidden="true" className="h-4 w-4" /> Print credential
          </button>
          <a href={`/${tenantSlug}/civic-actions/${credential.id}/claim`} className="app-btn btn-outline">
            <FiHash aria-hidden="true" className="h-4 w-4" /> View claim status
          </a>
        </div>
      </Card>
    </div>
  );
}
