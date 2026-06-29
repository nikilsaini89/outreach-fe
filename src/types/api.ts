export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
export type FollowupStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED';

export interface Followup {
  id: string;
  sequenceNumber: number;
  body: string;
  status: FollowupStatus;
  scheduledAt: string;
}

export interface Campaign {
  id: string;
  recipientEmail: string;
  subject: string;
  initialBody: string;
  status: CampaignStatus;
  createdAt: string;
  followups: Followup[];
}

export interface CreateCampaignRequest {
  recipientEmail: string;
  subject: string;
  initialBody: string;
  followupCount: number;
  gapDays: number;
  preferredHour: number;
}
