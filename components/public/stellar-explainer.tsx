import Link from 'next/link';
import type { ReactNode } from 'react';
import { FiArrowRight, FiCreditCard, FiHash, FiSmartphone } from 'react-icons/fi';
import { getTenantCopy } from '@/lib/tenant-copy';

export function StellarExplainer({
  tenantSlug,
  orgType
}: {
  tenantSlug: string;
  orgType?: string | null;
}) {
  const base = `/${tenantSlug}`;
  const copy = getTenantCopy(orgType);

  return (
    <section className="home-section stellar-panel">
      <div className="section-head">
        <h2>How Stellar fits in</h2>
        <Link href="/about">Learn more</Link>
      </div>

      <div className="stellar-panel-grid">
        <div className="stellar-panel-copy">
          <p>
            <strong>Two wallets, one public ledger.</strong> {copy.personLabel}s keep their own wallet. The organization keeps one wallet for payments and rewards. Stellar provides the permanent proof layer.
          </p>
          <div className="stellar-wallet-cards">
            <WalletRole icon={<FiHash className="h-5 w-5" />} title={copy.walletOrgLabel} body="Staff-managed. Receives payments, sends rewards." />
            <WalletRole icon={<FiSmartphone className="h-5 w-5" />} title="Your wallet" body="You control it. Pay via QR, receive rewards." />
          </div>
        </div>

        <div className="stellar-panel-steps">
          <ol className="stellar-steps">
            <li><span className="stellar-step-num">1</span><span><b>{copy.payCta}</b> — Open the payment QR in Freighter or any Stellar wallet</span></li>
            <li><span className="stellar-step-num">2</span><span><b>Prove</b> — Horizon verifies amount, destination, and memo</span></li>
            <li><span className="stellar-step-num">3</span><span><b>Check</b> — Receipt lives in the public ledger</span></li>
          </ol>
          <div className="stellar-panel-ctas">
            <Link href={`${base}/payments`} className="stellar-cta-link"><FiCreditCard className="h-4 w-4" /> {copy.payCta} <FiArrowRight className="ml-auto h-4 w-4" /></Link>
            <Link href={`${base}/ledger`} className="stellar-cta-link"><FiHash className="h-4 w-4" /> Public ledger <FiArrowRight className="ml-auto h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function WalletRole({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="stellar-wallet-card">
      <span className="stellar-wallet-card-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}
