import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Campaign } from '../types/api';
import { campaignBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Timeline } from '../components/Timeline';
import type { TimelineEntry } from '../components/Timeline';

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

function fmtDateShort(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso));
}

const IcoPause = () => (
  <svg className="ico" viewBox="0 0 16 16" fill="none">
    <rect x="5" y="3" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
  </svg>
);

const IcoPlay = () => (
  <svg className="ico" viewBox="0 0 16 16" fill="none">
    <path d="M5 3l8 5-8 5V3Z" fill="currentColor" />
  </svg>
);

const IcoTrash = () => (
  <svg className="ico" viewBox="0 0 16 16" fill="none">
    <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IcoGmail = () => (
  <svg className="ico" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l-3.5 4L6 12M3 8h8a3 3 0 0 0 0-6h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getCampaign(id)
      .then(setCampaign)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePause() {
    if (!campaign) return;
    setActionBusy(true);
    try {
      const updated = await api.pauseCampaign(campaign.id);
      setCampaign(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleResume() {
    if (!campaign) return;
    setActionBusy(true);
    try {
      const updated = await api.resumeCampaign(campaign.id);
      setCampaign(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <header className="topbar">
          <div className="crumbs">
            <Link to="/campaigns">Campaigns</Link>
            <span className="sep">/</span>
            <span className="here">Loading…</span>
          </div>
        </header>
        <div style={{ textAlign: 'center', padding: 'var(--s-12)' }}><Spinner /></div>
      </>
    );
  }

  if (error || !campaign) {
    return (
      <>
        <header className="topbar">
          <div className="crumbs">
            <Link to="/campaigns">Campaigns</Link>
            <span className="sep">/</span>
            <span className="here">Error</span>
          </div>
        </header>
        <div className="content">
          <div className="alert alert-error">{error ?? 'Campaign not found.'}</div>
        </div>
      </>
    );
  }

  const followups = campaign.followups ?? [];
  const sent = followups.filter(f => f.status === 'SENT').length;
  const pending = followups.filter(f => f.status === 'PENDING').length;
  const failed = followups.filter(f => f.status === 'FAILED').length;
  const nextPending = followups.find(f => f.status === 'PENDING');

  const entries: TimelineEntry[] = [
    { kind: 'initial', sentAt: campaign.createdAt, body: campaign.initialBody },
    ...followups.map(f => ({ kind: 'followup' as const, followup: f })),
  ];

  const isActive = campaign.status === 'ACTIVE';
  const isPaused = campaign.status === 'PAUSED';

  return (
    <>
      <header className="topbar">
        <div className="crumbs">
          <Link to="/campaigns">Campaigns</Link>
          <span className="sep">/</span>
          <span className="here">{campaign.recipientEmail}</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <IcoGmail /> Back
          </button>
          {isActive && (
            <button className="btn btn-secondary btn-sm" onClick={handlePause} disabled={actionBusy}>
              <IcoPause /> Pause
            </button>
          )}
          {isPaused && (
            <button className="btn btn-secondary btn-sm" onClick={handleResume} disabled={actionBusy}>
              <IcoPlay /> Resume
            </button>
          )}
        </div>
      </header>

      <div className="content">
        <div className="page-head">
          <div>
            <div className="row" style={{ marginBottom: 'var(--s-2)' }}>
              <h1 className="page-title" style={{ fontSize: 'var(--text-xl)' }}>{campaign.subject}</h1>
              {campaignBadge(campaign.status)}
            </div>
            <p className="page-sub">To <strong>{campaign.recipientEmail}</strong> · created {fmtDate(campaign.createdAt)}</p>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s-5)' }}>{error}</div>}

        <div className="stat-grid">
          <div className="stat">
            <div className="k">Follow-ups</div>
            <div className="v">{sent} <small>/ {followups.length} sent</small></div>
          </div>
          <div className="stat">
            <div className="k">Next send</div>
            <div className="v" style={{ fontSize: 'var(--text-xl)' }}>
              {nextPending ? fmtDateShort(nextPending.scheduledAt) : '—'}
            </div>
          </div>
          <div className="stat">
            <div className="k">Pending</div>
            <div className="v">{pending}</div>
          </div>
          <div className="stat">
            <div className="k">Failed</div>
            <div className="v">{failed}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="card">
            <div className="card-head">
              <h3>Thread timeline</h3>
              <span className="cell-muted">{1 + followups.length} messages</span>
            </div>
            <div className="card-pad" style={{ paddingTop: 'var(--s-5)' }}>
              <Timeline entries={entries} />
            </div>
          </div>

          <div>
            <div className="card card-pad" style={{ marginBottom: 'var(--s-5)' }}>
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--s-4)' }}>Campaign</h3>
              <div className="kvs">
                <div className="k">Recipient</div><div className="v">{campaign.recipientEmail}</div>
                <div className="k">Status</div><div className="v">{campaignBadge(campaign.status)}</div>
                <div className="k">Created</div><div className="v">{fmtDate(campaign.createdAt)}</div>
                <div className="k">ID</div>
                <div className="v">
                  <span className="tag-mono">{campaign.id.slice(0, 8)}…</span>
                </div>
              </div>
            </div>

            <div className="card card-pad">
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--s-4)' }}>Actions</h3>
              {isActive && (
                <button
                  className="btn btn-secondary btn-block"
                  style={{ marginBottom: 'var(--s-2)' }}
                  onClick={handlePause}
                  disabled={actionBusy}
                >
                  <IcoPause /> Pause campaign
                </button>
              )}
              {isPaused && (
                <button
                  className="btn btn-secondary btn-block"
                  style={{ marginBottom: 'var(--s-2)' }}
                  onClick={handleResume}
                  disabled={actionBusy}
                >
                  <IcoPlay /> Resume campaign
                </button>
              )}
              <p className="hint" style={{ margin: 'var(--s-2) 0 var(--s-4)' }}>
                Pausing holds all pending follow-ups. Resuming reschedules them from today.
              </p>
              <div className="divider" style={{ margin: 'var(--s-2) 0 var(--s-4)' }} />
              <button className="btn btn-danger btn-block" disabled={actionBusy}>
                <IcoTrash /> Cancel remaining follow-ups
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
