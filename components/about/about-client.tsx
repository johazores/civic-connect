'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiCheck,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiFlag,
  FiHash,
  FiHome,
  FiLink,
  FiLock,
  FiSearch,
  FiShield,
  FiSmartphone,
  FiUsers,
  FiX,
  FiZap
} from 'react-icons/fi';

/** Reveal-on-scroll wrapper. Content is server-rendered visible; JS only adds motion. */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add('in');
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`.trim()} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

export function AboutClient() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    return () => root.classList.remove('reveal-ready');
  }, []);

  return (
    <div className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">CT</div>
            <div className="min-w-0">
              <p className="app-title truncate">CivicTrust</p>
              <p className="app-subtitle truncate">How it works</p>
            </div>
          </div>
          <Link href="/" className="app-icon-btn" aria-label="Back to home">
            <FiHome aria-hidden="true" className="h-5 w-5" />
          </Link>
        </header>

        <div className="civic-viewport viewport-flow" style={{ paddingBottom: 'calc(var(--safe-bottom) + 32px)' }}>
          {/* ============ HERO ============ */}
          <section className="px-5 pt-4">
            <div className="app-pulse-card fade-up p-6">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#cfe0f4]">
                  <FiZap aria-hidden="true" className="h-3.5 w-3.5" /> Public payment proof
                </span>
                <h1 className="mt-4 font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
                  Civic services citizens can actually verify.
                </h1>
                <p className="mt-3 text-[14px] font-medium leading-6 text-[#b9d0ea]">
                  Report an issue, pay a service fee, and walk away with a public receipt anyone can check.
                </p>
                <div className="mt-5 flex gap-5 border-t border-white/15 pt-4">
                  <HeroStat value="QR" label="Wallet pay" />
                  <HeroStat value="ID" label="Public proof" />
                  <HeroStat value="Check" label="Verified" />
                </div>
              </div>
            </div>
          </section>

          {/* ============ WHAT IT IS ============ */}
          <section className="px-5 pt-8">
            <Reveal>
              <span className="about-eyebrow">What it is</span>
              <h2 className="about-section-title mt-3">A civic operating system with trust built in.</h2>
              <p className="about-lead">
                CivicTrust gives local governments - cities, municipalities, barangays, and provinces - one app for citizen
                requests, service payments, and public records. Each organization gets its own secure space, with a public
                portal for residents and a staff workspace for operations.
              </p>
            </Reveal>
            <div className="mt-5 grid gap-3">
              {[
                { icon: <FiSmartphone />, title: 'One mobile-first app', body: 'Residents report, track, pay, and read updates from a single phone-native experience.' },
                { icon: <FiActivity />, title: 'A real staff workspace', body: 'Teams route requests, update status, manage services, and review verified payments.' },
                { icon: <FiShield />, title: 'Trust as a feature', body: 'Payments and records carry public proof, not just an internal office record.' }
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 80}>
                  <FeatureRow icon={item.icon} title={item.title} body={item.body} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ THE PROBLEM ============ */}
          <section className="px-5 pt-9">
            <Reveal>
              <span className="about-eyebrow" style={{ background: 'var(--ember-soft)', color: 'var(--ember-600)' }}>
                The problem
              </span>
              <h2 className="about-section-title mt-3">Citizens are asked to trust what they can&rsquo;t see.</h2>
              <p className="about-lead">
                When you pay a government fee, you usually get a paper stub or a number in a system only the office can read. If
                a record is questioned - a payment, a disbursement, a receipt - there is no independent way to prove it. Trust
                depends entirely on the institution&rsquo;s word.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <div className="app-info-card mt-5 p-5">
                <p className="text-sm font-semibold leading-6 text-[var(--ink-2)]">
                  CivicTrust closes that gap: once a payment is confirmed, it gets a public proof that the citizen, the office,
                  and any observer can check later.
                </p>
              </div>
            </Reveal>
          </section>

          {/* ============ WHO USES IT ============ */}
          <section className="px-5 pt-9">
            <Reveal>
              <span className="about-eyebrow">Who uses it</span>
              <h2 className="about-section-title mt-3">Three roles, one trusted record.</h2>
            </Reveal>
            <div className="mt-5 grid gap-3">
              {[
                {
                  icon: <FiUsers />,
                  tone: 'navy',
                  title: 'Citizens',
                  body: 'Submit concerns with photos, track progress by reference number, pay fees from their own wallet, and keep verifiable receipts.'
                },
                {
                  icon: <FiShield />,
                  tone: 'ember',
                  title: 'Staff & administrators',
                  body: 'Triage the report queue, assign departments, update status, manage services and content, and review confirmed payments.'
                },
                {
                  icon: <FiHome />,
                  tone: 'teal',
                  title: 'Organizations',
                  body: 'Each LGU has its own branded space, services, wallet, and public transparency records.'
                }
              ].map((role, index) => (
                <Reveal key={role.title} delay={index * 80}>
                  <RoleCard {...role} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ THE JOURNEY ============ */}
          <section className="px-5 pt-9">
            <Reveal>
              <span className="about-eyebrow">The journey</span>
              <h2 className="about-section-title mt-3">From request to public receipt.</h2>
              <p className="about-lead">Follow a single service request through the whole flow.</p>
            </Reveal>
            <div className="timeline mt-6">
              {[
                { icon: <FiFlag />, tone: '', title: 'Submit a request', body: 'A resident reports an issue or starts a paid service, adding details, a location, and an optional photo.' },
                { icon: <FiSearch />, tone: '', title: 'Get a reference number', body: 'An auto-generated tracking code lets them follow status and updates from any device.' },
                { icon: <FiCreditCard />, tone: 'ember', title: 'Pay from your own wallet', body: 'For fees, the app creates a payment link and QR code. The citizen approves it in their own wallet, and the app never asks for a private key.' },
                { icon: <FiHash />, tone: '', title: 'Payment is confirmed', body: 'CivicTrust checks the payment amount, receipt note, and destination wallet.' },
                { icon: <FiCheckCircle />, tone: 'teal', title: 'Permanent public receipt', body: 'A receipt page is created with a payment ID that the citizen and office can check later.' }
              ].map((step, index) => (
                <Reveal key={step.title} delay={index * 70}>
                  <div className="tl-item">
                    <div className="tl-rail">
                      <span className={`tl-node ${step.tone}`.trim()}>{step.icon}</span>
                      <span className="tl-line" />
                    </div>
                    <div className="tl-body">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Step {index + 1}</p>
                      <h3 className="mt-0.5 font-display text-[16px] font-bold text-[var(--ink)]">{step.title}</h3>
                      <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-[var(--ink-2)]">{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ HOW STELLAR POWERS IT ============ */}
          <section className="px-5 pt-9">
            <Reveal>
              <span className="about-eyebrow">How public proof works</span>
              <h2 className="about-section-title mt-3">The trust layer, in four simple pieces.</h2>
            </Reveal>
            <div className="mt-5 grid gap-3">
              {[
                { icon: <FiSmartphone />, title: 'Payment links and QR codes', body: 'Citizens can pay in the wallet they already trust. CivicTrust never takes control of their wallet.' },
                { icon: <FiLink />, title: 'Payment checks', body: 'Every payment is checked for amount, receipt note, destination wallet, and public record number.' },
                { icon: <FiFileText />, title: 'Public receipts', body: 'Each receipt gets a payment ID that anyone can check later.' },
                { icon: <FiLock />, title: 'Protected LGU wallets', body: 'Each organization has its own wallet, and private keys stay protected.' }
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 70}>
                  <FeatureRow icon={item.icon} title={item.title} body={item.body} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ WHY STELLAR VS TRADITIONAL ============ */}
          <section className="px-5 pt-9">
            <Reveal>
              <span className="about-eyebrow">Why public proof</span>
              <h2 className="about-section-title mt-3">Why not just a card processor?</h2>
              <p className="about-lead">
                Traditional payment systems move money, but the proof often stays inside private systems. CivicTrust makes the
                proof public, portable, and permanent - exactly what civic trust needs.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <div className="vs-grid mt-5">
                <div className="vs-col old">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Traditional payment record</p>
                  {[
                    'Receipt lives in one private database',
                    'Citizens can’t independently verify it',
                    'Reconciliation is manual and opaque',
                    'Processor lock-in and higher fees'
                  ].map((row) => (
                    <div key={row} className="vs-row">
                      <FiX aria-hidden="true" className="text-[var(--ember-600)]" />
                      <span>{row}</span>
                    </div>
                  ))}
                </div>
                <div className="vs-col new">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--navy)]">CivicTrust public proof</p>
                  {[
                    'Permanent public record',
                    'Anyone can check the payment',
                    'Automatic proof by payment ID',
                    'Open network, low fees, no lock-in'
                  ].map((row) => (
                    <div key={row} className="vs-row" style={{ color: 'var(--ink)' }}>
                      <FiCheck aria-hidden="true" className="text-[#0f806d]" />
                      <span>{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>

          {/* ============ THE VISION ============ */}
          <section className="px-5 pt-9">
            <Reveal>
              <span className="about-eyebrow">The vision</span>
              <h2 className="about-section-title mt-3">Proof-of-payment is only the start.</h2>
              <p className="about-lead">The same trust layer extends across civic life:</p>
            </Reveal>
            <div className="mt-5 grid gap-3">
              {[
                { icon: <FiAward />, title: 'Civic participation rewards', body: 'Verified attendance and civic actions can trigger public reward payments.' },
                { icon: <FiActivity />, title: 'Environmental cleanup incentives', body: 'Reviewed cleanup submissions can be rewarded, with every payout publicly traceable.' },
                { icon: <FiHash />, title: 'Municipal budget transparency', body: 'Public allocations and disbursements are recorded with payment IDs.' },
                { icon: <FiFileText />, title: 'Digital property tax receipts', body: 'Tax receipts carry a permanent payment ID citizens can check for years.' }
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 70}>
                  <FeatureRow icon={item.icon} title={item.title} body={item.body} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ CTA ============ */}
          <section className="px-5 pb-2 pt-9">
            <Reveal>
              <div className="brand-panel p-6 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]">
                  <FiShield aria-hidden="true" className="h-7 w-7" />
                </span>
                <h2 className="mt-4 font-display text-[22px] font-extrabold tracking-[-0.02em] text-[var(--ink)]">See it in action.</h2>
                <p className="mx-auto mt-2 max-w-[19rem] text-[14px] font-medium leading-6 text-[var(--ink-2)]">
                  Explore a live demo city, or open the practice payment page to try it yourself.
                </p>
                <div className="mt-5 grid gap-2.5">
                  <Link href="/metro-city" className="app-btn btn-primary">
                    Explore the demo city <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  <Link href="/stellar-playground" className="app-btn btn-outline">
                    <FiZap aria-hidden="true" className="h-4 w-4" /> Open practice payments
                  </Link>
                </div>
              </div>
            </Reveal>
            <p className="mt-6 text-center text-[12px] font-semibold text-[var(--muted)]">CivicTrust - Civic services with public proof</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b className="block font-display text-[17px] font-bold text-white">{value}</b>
      <span className="text-[11.5px] font-semibold text-[#9fc0e6]">{label}</span>
    </div>
  );
}

function FeatureRow({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="app-feed-card flex items-start gap-3.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--surface-2)] text-[var(--navy)]">{icon}</span>
      <div className="min-w-0">
        <h3 className="font-display text-[15.5px] font-bold text-[var(--ink)]">{title}</h3>
        <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-[var(--ink-2)]">{body}</p>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, body, tone }: { icon: ReactNode; title: string; body: string; tone: string }) {
  const toneClass = tone === 'ember' ? 'tl-node ember' : tone === 'teal' ? 'tl-node teal' : 'tl-node';
  return (
    <div className="app-feed-card flex items-start gap-3.5">
      <span className={`${toneClass} shrink-0`}>{icon}</span>
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-bold text-[var(--ink)]">{title}</h3>
        <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-[var(--ink-2)]">{body}</p>
      </div>
    </div>
  );
}
