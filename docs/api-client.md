# API Client

File: `src/lib/api.ts`

## Methods

```ts
api.listCampaigns()                     → Promise<Campaign[]>
api.getCampaign(id: string)             → Promise<Campaign>
api.createCampaign(data: CreateCampaignRequest) → Promise<Campaign>
api.pauseCampaign(id: string)           → Promise<Campaign>
api.resumeCampaign(id: string)          → Promise<Campaign>
```

All methods return the parsed JSON body or throw an `Error` with the response text (or `HTTP <status>` if body is empty).

## How requests work

Every call goes through `request<T>(path, init?)`:

1. Reads `ce_authToken` from `localStorage`.
2. Builds headers: `Content-Type: application/json` + `Authorization: Bearer <token>` (omitted if no token).
3. Calls `fetch(base + path, { ...init, headers })`. `base` = `VITE_API_BASE_URL` env var, empty string in dev (Vite proxy handles routing).
4. On **401**: calls `refreshAuthToken()`, then retries once with the new token.
5. On any other non-2xx: throws `Error(responseText || 'HTTP <status>')`.
6. On 2xx: returns `res.json()`.

## Adding a new API call

```ts
// In api.ts, add to the `api` object:
cancelFollowups: (campaignId: string) =>
  request<Campaign>(`/campaigns/${campaignId}/followups`, { method: 'DELETE' }),
```

That's it — auth header, 401 retry, and error handling are inherited from `request<T>`.

## 401 handling detail

```ts
async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('ce_refreshToken');
  if (!refreshToken) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return null;
  }
  const res = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return null;
  }
  const { authToken } = await res.json();
  localStorage.setItem('ce_authToken', authToken);
  return authToken;
}
```

`auth:expired` event → `AuthProvider` listener → clears tokens → `userId` becomes null → `RequireAuth` redirects to `/login`.

## Types

```ts
// src/types/api.ts — mirrors backend DTOs exactly

type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
type FollowupStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED';

interface Followup {
  id: string;
  sequenceNumber: number;     // 1-based
  body: string;               // AI-generated
  status: FollowupStatus;
  scheduledAt: string;        // ISO LocalDateTime — no sentAt exists on backend
}

interface Campaign {
  id: string;
  recipientEmail: string;
  subject: string;
  initialBody: string;
  status: CampaignStatus;
  createdAt: string;          // ISO LocalDateTime
  followups: Followup[];
}

interface CreateCampaignRequest {
  recipientEmail: string;
  subject: string;
  initialBody: string;        // field name is initialBody, not body
  followupCount: number;      // field name is followupCount, not numberOfFollowUps
  gapDays: number;
  preferredHour: number;      // 0–23 integer
}
```

**Critical naming:** the backend expects `initialBody` (not `body`) and `followupCount` (not `numberOfFollowUps`). These were the source of a past bug — do not rename them.
