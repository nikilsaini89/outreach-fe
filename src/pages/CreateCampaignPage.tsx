import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AiTag } from '../components/ui/AiTag';

const HOURS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function addDays(base: Date, n: number, hour: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function fmtPreview(d: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
}

const IcoSend = () => (
  <svg className="ico" viewBox="0 0 16 16" fill="none">
    <path d="M14 2 7 9M14 2l-4.5 12-2.5-5-5-2.5L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export function CreateCampaignPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [initialBody, setInitialBody] = useState('');
  const [numberOfFollowUps, setNumberOfFollowUps] = useState(3);
  const [gapDays, setGapDays] = useState(3);
  const [preferredHour, setPreferredHour] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setError(null);
    try {
      const campaign = await api.createCampaign({
        userId,
        recipientEmail,
        subject,
        initialBody,
        followupCount: numberOfFollowUps,
        gapDays,
        preferredHour,
      });
      navigate(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  const now = new Date();
  const previewDates = Array.from({ length: numberOfFollowUps }, (_, i) =>
    addDays(now, (i + 1) * gapDays, preferredHour)
  );

  return (
    <>
      <header className="topbar">
        <div className="crumbs">
          <Link to="/campaigns">Campaigns</Link>
          <span className="sep">/</span>
          <span className="here">New campaign</span>
        </div>
        <div className="topbar-actions">
          <Link to="/campaigns" className="btn btn-ghost btn-sm">Cancel</Link>
          <button
            form="create-form"
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting}
          >
            <IcoSend /> {submitting ? 'Sending…' : 'Send & schedule'}
          </button>
        </div>
      </header>

      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-title">New campaign</h1>
            <p className="page-sub">Write the first email. We generate and schedule the follow-ups automatically.</p>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s-5)' }}>{error}</div>}

        <form id="create-form" onSubmit={handleSubmit}>
          <div className="create-grid">
            <div>
              <div className="card card-pad">
                <div className="field">
                  <label className="label">Recipient email</label>
                  <input
                    className="input"
                    type="email"
                    required
                    placeholder="john.carter@acme.io"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label">Subject</label>
                  <input
                    className="input"
                    required
                    placeholder="Software Engineer opportunity at Zeta"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label">Initial email</label>
                  <textarea
                    className="textarea"
                    required
                    placeholder={"Hi John,\n\nI came across your work on…"}
                    value={initialBody}
                    onChange={e => setInitialBody(e.target.value)}
                  />
                  <div className="hint">Plain text. Personalize the opener — generic intros get ignored.</div>
                </div>

                <div className="divider" />

                <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--s-2)' }}>Follow-up sequence</h3>
                <p className="muted" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--s-5)' }}>
                  AI drafts each follow-up from your initial email. All replies stay in the same Gmail thread.
                </p>

                <div className="field-row">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="label">Number of follow-ups</label>
                    <div className="stepper">
                      <button type="button" onClick={() => setNumberOfFollowUps(n => Math.max(1, n - 1))}>−</button>
                      <div className="val">{numberOfFollowUps}</div>
                      <button type="button" onClick={() => setNumberOfFollowUps(n => Math.min(10, n + 1))}>+</button>
                    </div>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="label">Gap between sends</label>
                    <div className="input-group">
                      <input
                        className="input"
                        type="number"
                        min={1}
                        max={30}
                        value={gapDays}
                        onChange={e => setGapDays(Number(e.target.value))}
                      />
                      <div className="input-suffix">days</div>
                    </div>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="label">Preferred send hour</label>
                    <select
                      className="select"
                      value={String(preferredHour).padStart(2, '0') + ':00'}
                      onChange={e => setPreferredHour(parseInt(e.target.value))}
                    >
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <div className="hint">Local time</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <div className="card-head">
                  <h3>Schedule preview</h3>
                  <AiTag />
                </div>
                <div className="card-pad" style={{ paddingTop: 'var(--s-5)' }}>
                  <div className="alert alert-info" style={{ marginBottom: 'var(--s-5)' }}>
                    Initial email sends immediately on create.
                  </div>
                  <div className="timeline">
                    <div className="tl-item">
                      <div className="tl-rail"><div className="tl-node">0</div></div>
                      <div className="tl-card">
                        <div className="top"><span className="seq">Initial email</span><span className="when">Now</span></div>
                        <div className="body">Sends the moment you click "Send & schedule."</div>
                      </div>
                    </div>
                    {previewDates.map((d, i) => (
                      <div key={i} className="tl-item">
                        <div className="tl-rail"><div className="tl-node">{i + 1}</div></div>
                        <div className="tl-card">
                          <div className="top">
                            <span className="seq">Follow-up {i + 1}</span>
                            <span className="when">{fmtPreview(d)}</span>
                          </div>
                          <div className="body">{previewDescription(i, numberOfFollowUps)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function previewDescription(index: number, total: number): string {
  if (index === 0) return 'Gentle nudge referencing the original ask.';
  if (index === total - 1) return 'Polite final check-in / break-up note.';
  return 'Adds a new angle or value prop.';
}
