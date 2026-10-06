import type { Followup, FollowupStatus } from '../types/api';
import { followupBadge } from './ui/Badge';
import { AiTag } from './ui/AiTag';

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function nodeClass(status: FollowupStatus) {
  if (status === 'SENT') return 'tl-node sent';
  if (status === 'PROCESSING') return 'tl-node processing';
  if (status === 'FAILED') return 'tl-node failed';
  if (status === 'GENERATING') return 'tl-node generating';
  return 'tl-node';
}

function nodeLabel(status: FollowupStatus, seq: number) {
  if (status === 'SENT') return '✓';
  return String(seq);
}

interface InitialItem {
  kind: 'initial';
  sentAt: string;
  body: string;
  status: 'SENT' | 'FAILED';
}

interface FollowupItem {
  kind: 'followup';
  followup: Followup;
}

type TimelineEntry = InitialItem | FollowupItem;

interface TimelineProps {
  entries: TimelineEntry[];
}

function InitialCard({ item }: { item: InitialItem }) {
  return (
    <div className="tl-card">
      <div className="top">
        <span className="seq">Initial email</span>
        {followupBadge(item.status)}
      </div>
      <div className="when" style={{ marginBottom: 'var(--s-2)' }}>{fmtDateTime(item.sentAt)}</div>
      <div className="body">{item.body}</div>
    </div>
  );
}

function FollowupCard({ followup }: { followup: Followup }) {
  if (followup.status === 'GENERATING') {
    return (
      <div className="tl-card tl-card-generating">
        <div className="top">
          <span className="seq">Follow-up {followup.sequenceNumber} <AiTag /></span>
          {followupBadge(followup.status)}
        </div>
        <div className="when" style={{ marginBottom: 'var(--s-2)' }}>
          Scheduled {fmtDateTime(followup.scheduledAt)}
        </div>
        <div className="body generating-placeholder">AI is writing this follow-up…</div>
      </div>
    );
  }

  const when = followup.status === 'SENT'
    ? fmtDateTime(followup.scheduledAt)
    : `Scheduled ${fmtDateTime(followup.scheduledAt)}`;

  return (
    <div className="tl-card">
      <div className="top">
        <span className="seq">
          Follow-up {followup.sequenceNumber}
          <AiTag />
        </span>
        {followupBadge(followup.status)}
      </div>
      <div className="when" style={{ marginBottom: 'var(--s-2)' }}>{when}</div>
      <div className="body">{followup.body}</div>
    </div>
  );
}

export function Timeline({ entries }: TimelineProps) {
  return (
    <div className="timeline">
      {entries.map((entry, i) => {
        if (entry.kind === 'initial') {
          return (
            <div key={`initial-${i}`} className="tl-item">
              <div className="tl-rail">
                <div className={entry.status === 'FAILED' ? 'tl-node failed' : 'tl-node sent'}>
                  {entry.status === 'FAILED' ? '✗' : '✓'}
                </div>
              </div>
              <InitialCard item={entry} />
            </div>
          );
        }
        const { followup } = entry;
        return (
          <div key={followup.id} className="tl-item">
            <div className="tl-rail">
              <div className={nodeClass(followup.status)}>
                {nodeLabel(followup.status, followup.sequenceNumber)}
              </div>
            </div>
            <FollowupCard followup={followup} />
          </div>
        );
      })}
    </div>
  );
}

export type { TimelineEntry };
