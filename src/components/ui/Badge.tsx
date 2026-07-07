import type { CampaignStatus, FollowupStatus } from '../../types/api';

type BadgeVariant = Lowercase<CampaignStatus | FollowupStatus>;

const LABELS: Record<string, string> = {
  active: 'Active', paused: 'Paused', completed: 'Completed', failed: 'Failed', cancelled: 'Cancelled',
  pending: 'Pending', processing: 'Processing', sent: 'Sent',
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span className={`badge badge-${variant}`}>
      <span className="dot" />
      {LABELS[variant] ?? variant}
    </span>
  );
}

export function campaignBadge(status: CampaignStatus) {
  return <Badge variant={status.toLowerCase() as BadgeVariant} />;
}

export function followupBadge(status: FollowupStatus) {
  return <Badge variant={status.toLowerCase() as BadgeVariant} />;
}
