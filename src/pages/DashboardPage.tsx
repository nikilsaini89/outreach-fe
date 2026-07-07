import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Campaign } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { campaignBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

function fmtDate(iso: string) {
return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

function IcoPlus() {
  return (
    <svg className="ico" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.listCampaigns()
      .then(setCampaigns)
      .catch(() => setError('Failed to load campaigns. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = campaigns.filter(c =>
    !search || c.recipientEmail.includes(search) || c.subject.toLowerCase().includes(search.toLowerCase())
  );

  const active    = campaigns.filter(c => c.status === 'ACTIVE').length;
  const paused    = campaigns.filter(c => c.status === 'PAUSED').length;
  const sent      = campaigns.flatMap(c => c.followups ?? []).filter(f => f.status === 'SENT').length;
  const scheduled = campaigns.flatMap(c => c.followups ?? []).filter(f => f.status === 'PENDING').length;

  return (
    <>
      <header className="topbar">
        <div className="crumbs"><span className="here">Campaigns</span></div>
      </header>

      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-title">Campaigns</h1>
            <p className="page-sub">Every campaign is one outreach thread with AI-scheduled follow-ups.</p>
          </div>
          <Link to="/campaigns/new" className="btn btn-primary">
            <IcoPlus /> New campaign
          </Link>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s-5)' }}>{error}</div>}

        {!loading && campaigns.length > 0 && (
          <div className="stat-grid">
            <div className="stat"><div className="k">Active</div><div className="v">{active}</div></div>
            <div className="stat"><div className="k">Paused</div><div className="v">{paused}</div></div>
            <div className="stat"><div className="k">Follow-ups sent</div><div className="v">{sent}</div></div>
            <div className="stat"><div className="k">Scheduled</div><div className="v">{scheduled} <small>pending</small></div></div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--s-12)' }}><Spinner /></div>
        ) : campaigns.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="emoji">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7l9 6 9-6M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7M3 7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1" stroke="var(--accent-500)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>No campaigns yet</h3>
              <p>Write one cold email. ColdEmailer drafts the follow-ups with AI, schedules them, and sends each one in the same Gmail thread.</p>
              <Link to="/campaigns/new" className="btn btn-primary btn-lg">
                <IcoPlus /> Create your first campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="row">
                <strong style={{ fontSize: 'var(--text-md)' }}>All campaigns</strong>
                <span className="cell-muted">{campaigns.length} total</span>
              </div>
              <div className="row">
                <input
                  className="input"
                  style={{ height: 32, width: 220 }}
                  placeholder="Search recipient or subject"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Recipient</th>
                  <th style={{ width: '30%' }}>Subject</th>
                  <th>Follow-ups</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--s-10)', color: 'var(--text-muted)' }}>
                      No campaigns match "{search}"
                    </td>
                  </tr>
                ) : filtered.map(c => {
                  const followups = c.followups ?? [];
                  const sentCount = followups.filter(f => f.status === 'SENT').length;
                  return (
                    <tr key={c.id} onClick={() => navigate(`/campaigns/${c.id}`)}>
                      <td><span className="cell-strong">{c.recipientEmail}</span></td>
                      <td>{c.subject}</td>
                      <td><span className="cell-muted">{sentCount} / {followups.length} sent</span></td>
                      <td>{campaignBadge(c.status)}</td>
                      <td className="cell-muted">{fmtDate(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
