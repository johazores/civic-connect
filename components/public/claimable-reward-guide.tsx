'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiExternalLink, FiGift, FiRefreshCw } from 'react-icons/fi';
import { Card } from '@/components/ui/card';
import { StellarProof } from '@/components/stellar/stellar-proof';
import { stellarExpertClaimableBalanceUrl } from '@/lib/stellar/explorer';

type ClaimStatus = {
  actionId: string;
  payoutMethod: string;
  claimableBalanceId: string | null;
  isClaimed: boolean;
  amount?: string;
  assetCode?: string;
  claimant?: string | null;
  status: string;
  rewardTransactionHash?: string | null;
};

export function ClaimableRewardGuide({
  tenantSlug,
  actionId,
  participantName,
  title
}: {
  tenantSlug: string;
  actionId: string;
  participantName: string;
  title: string;
}) {
  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadStatus() {
    setIsLoading(true);
    setError('');

    const response = await fetch(`/api/tenant/${tenantSlug}/civic-actions/${actionId}/claim-status`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to load claim status.');
      setIsLoading(false);
      return;
    }

    setStatus(payload.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadStatus();
  }, [tenantSlug, actionId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm font-semibold text-[var(--muted)]">Loading reward status...</p>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card className="p-6">
        <p className="text-sm font-semibold text-[var(--ember-600)]">{error || 'Reward not found.'}</p>
      </Card>
    );
  }

  const balanceUrl = status.claimableBalanceId
    ? stellarExpertClaimableBalanceUrl(status.claimableBalanceId, 'TESTNET')
    : null;

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]">
            <FiGift aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Reserved reward</p>
            <h2 className="mt-1 font-display text-[18px] font-bold text-[var(--ink)]">{title}</h2>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">For {participantName}</p>
          </div>
        </div>

        {status.amount ? (
          <div className="mt-4 rounded-[14px] bg-[var(--surface-2)] p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Amount waiting</p>
            <p className="mt-1 font-display text-[20px] font-bold text-[var(--ink)]">
              {status.amount} {status.assetCode || 'XLM'}
            </p>
          </div>
        ) : null}

        {status.isClaimed ? (
          <div className="mt-4 rounded-[16px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[#0f806d]">
              <FiCheckCircle aria-hidden="true" className="h-4 w-4" /> Reward claimed or already delivered
            </p>
          </div>
        ) : status.claimableBalanceId ? (
          <div className="mt-4 grid gap-3">
            <p className="text-sm font-medium leading-6 text-[var(--muted)]">
              This reward is held as a Stellar claimable balance. Open Freighter or Lobstr, go to claimable balances, and claim using the ID below.
            </p>
            <div className="rounded-[14px] border border-[var(--line)] p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Claimable balance ID</p>
              <p className="mt-1 break-all font-mono text-xs font-semibold text-[var(--ink)]">{status.claimableBalanceId}</p>
            </div>
            {balanceUrl ? (
              <a href={balanceUrl} target="_blank" rel="noreferrer" className="app-btn btn-outline">
                <FiExternalLink aria-hidden="true" className="h-4 w-4" /> View on explorer
              </a>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm font-medium text-[var(--muted)]">Reward is being processed or was sent directly to your wallet.</p>
        )}

        {status.rewardTransactionHash ? (
          <div className="mt-4">
            <StellarProof transactionHash={status.rewardTransactionHash} network="TESTNET" claimableBalanceId={status.claimableBalanceId} />
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          <button type="button" onClick={loadStatus} className="app-btn btn-outline">
            <FiRefreshCw aria-hidden="true" className="h-4 w-4" /> Refresh status
          </button>
          <Link href={`/${tenantSlug}/wallet`} className="app-btn btn-secondary">
            Wallet setup guide
          </Link>
        </div>
      </Card>
    </div>
  );
}
