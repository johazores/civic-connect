'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import {
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiMapPin,
  FiSearch,
  FiTag,
  FiTool,
  FiUser,
  FiXCircle
} from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';

const statusSteps = ['SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

type TrackedReport = {
  referenceCode: string;
  title: string;
  description: string;
  locationText: string;
  status: string;
  priority: string;
  submittedAt: string;
  category: { name: string };
  department: { name: string } | null;
  attachments: Array<{ id: string; imageUrl: string }>;
  updates: Array<{
    id: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
};

function niceLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getProgress(status: string) {
  const index = statusSteps.indexOf(status);
  return index >= 0 ? Math.round(((index + 1) / statusSteps.length) * 100) : 20;
}

const updateMeta: Record<string, { icon: ComponentType<{ className?: string }>; nic: string }> = {
  SUBMITTED: { icon: FiFileText, nic: 'nic-blue' },
  REVIEWING: { icon: FiEye, nic: 'nic-gold' },
  ASSIGNED: { icon: FiUser, nic: 'nic-navy' },
  IN_PROGRESS: { icon: FiTool, nic: 'nic-gold' },
  RESOLVED: { icon: FiCheckCircle, nic: 'nic-teal' },
  REJECTED: { icon: FiXCircle, nic: 'nic-ember' }
};

export function TrackReport({ tenantSlug, initialReference }: { tenantSlug: string; initialReference?: string }) {
  const [referenceCode, setReferenceCode] = useState(initialReference || '');
  const [report, setReport] = useState<TrackedReport | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const progress = useMemo(() => (report ? getProgress(report.status) : 0), [report]);

  async function loadReport(nextReference = referenceCode) {
    const cleanReference = nextReference.trim();

    if (!cleanReference) {
      return;
    }

    setIsLoading(true);
    setError('');
    setReport(null);

    const response = await fetch(`/api/tenant/${tenantSlug}/reports/${encodeURIComponent(cleanReference)}`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Report was not found.');
      setIsLoading(false);
      return;
    }

    setReport(payload.data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (initialReference) {
      loadReport(initialReference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReference]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadReport();
  }

  const isRejected = report?.status === 'REJECTED';
  const currentStepIndex = report ? statusSteps.indexOf(report.status) : -1;

  return (
    <div className="grid gap-5">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="input-label" htmlFor="track-reference">
            Reference number
          </label>
          <div className="searchbar" style={{ minHeight: 54 }}>
            <FiSearch aria-hidden="true" />
            <input
              id="track-reference"
              required
              value={referenceCode}
              onChange={(event) => setReferenceCode(event.target.value)}
              placeholder="MCS-2026-0001"
            />
          </div>
        </div>
        <Button type="submit" className="btn-block" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Track request'}
        </Button>
        {error ? (
          <p className="mt-4 rounded-2xl bg-[var(--ember-soft)] p-4 text-sm font-bold text-[var(--ember-600)]">{error}</p>
        ) : null}
      </form>

      {report ? (
        <>
          <Card>
            <div className="min-w-0">
              <p className="break-all text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{report.referenceCode}</p>
              <h2 className="mt-1.5 break-words font-display text-lg font-bold leading-snug text-[var(--ink)]">{report.title}</h2>
              <p className="mt-1.5 text-[13px] font-medium text-[var(--muted)]">Submitted {formatDate(report.submittedAt)}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge value={report.status} />
              <Badge value={report.priority} />
            </div>
          </Card>

          {isRejected ? (
            <Card>
              <div className="flex items-start gap-3">
                <span className="nic nic-ember">
                  <FiXCircle aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold text-[var(--ink)]">This report was closed</p>
                  <p className="mt-1 break-words text-[13px] font-medium leading-relaxed text-[var(--ink-2)]">
                    This request was reviewed and closed without further action. See the update trail below for details.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[var(--ink-2)]">Progress</p>
                <p className="text-sm font-extrabold text-[var(--ink)]">{progress}%</p>
              </div>
              <div className="heatbar mt-3">
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 grid gap-1">
                {statusSteps.map((step, index) => {
                  const isDone = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step} className="flex min-h-[44px] items-center gap-3">
                      <span
                        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${
                          isDone
                            ? 'bg-[color-mix(in_srgb,var(--heat-1)_16%,var(--surface))] text-[#0f806d]'
                            : isCurrent
                              ? 'bg-[color-mix(in_srgb,var(--navy)_12%,var(--surface))] text-[var(--navy)]'
                              : 'bg-[var(--surface-2)] text-[var(--muted)]'
                        }`}
                      >
                        {isDone ? (
                          <FiCheck aria-hidden="true" className="h-4 w-4" />
                        ) : isCurrent ? (
                          <FiClock aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      <span
                        className={`min-w-0 text-sm ${
                          isDone || isCurrent ? 'font-semibold text-[var(--ink)]' : 'font-medium text-[var(--muted)]'
                        }`}
                      >
                        {niceLabel(step)}
                      </span>
                      {isCurrent ? (
                        <span className="status-pill ml-auto bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]">
                          Current
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="menu-group">
            <DetailRow icon={<FiTag aria-hidden="true" className="h-4 w-4" />} label="Category" value={report.category.name} />
            <DetailRow
              icon={<FiBriefcase aria-hidden="true" className="h-4 w-4" />}
              label="Department"
              value={report.department?.name || 'Not assigned yet'}
            />
            <DetailRow icon={<FiMapPin aria-hidden="true" className="h-4 w-4" />} label="Location" value={report.locationText} />
          </div>

          <Card>
            <p className="group-label">Description</p>
            <p className="mt-2 break-words text-[13.5px] font-medium leading-relaxed text-[var(--ink-2)]">{report.description}</p>
          </Card>

          {report.attachments.length > 0 ? (
            <div className="grid gap-3">
              {report.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)]"
                >
                  <img src={attachment.imageUrl} alt="Report attachment" className="h-56 w-full object-cover" />
                </a>
              ))}
            </div>
          ) : null}

          <div>
            <div className="section-head">
              <h2>Update trail</h2>
            </div>
            <div>
              {report.updates.map((update) => {
                const meta = updateMeta[update.status] || { icon: FiFileText, nic: 'nic-navy' };
                const Icon = meta.icon;
                return (
                  <div key={update.id} className="notif">
                    <span className={`nic ${meta.nic}`}>
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div className="nbody">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge value={update.status} />
                        <span className="text-[11.5px] font-semibold text-[var(--muted)]">{formatDate(update.createdAt)}</span>
                      </div>
                      <p className="mt-2">{update.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="menu-item">
      <span className="mi-ic">{icon}</span>
      <span className="mi-tx">
        <span>{label}</span>
        <b className="break-words">{value}</b>
      </span>
    </div>
  );
}
