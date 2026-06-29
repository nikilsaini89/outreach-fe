# Components

## Pages

### LoginPage — `/login`
**File:** `src/pages/LoginPage.tsx`

Two-column layout (dark aside + white card). Single "Continue with Google" button that calls `useAuth().login()`. Shows error alert if the backend isn't reachable. No state beyond `busy` + `error`.

---

### DashboardPage — `/campaigns`
**File:** `src/pages/DashboardPage.tsx`

Fetches `api.listCampaigns()` on mount (and when `userId` changes). Renders:
- Stats strip (active, paused, follow-ups sent, scheduled) — only shown when campaigns exist
- Searchable table (filter by recipientEmail or subject)
- Empty state with CTA when no campaigns
- Row click → `navigate('/campaigns/:id')`

---

### CreateCampaignPage — `/campaigns/new`
**File:** `src/pages/CreateCampaignPage.tsx`

Two-column form (inputs left, schedule preview right).

**Form fields → request mapping:**

| UI label | State var | Request field |
|---|---|---|
| Recipient email | `recipientEmail` | `recipientEmail` |
| Subject | `subject` | `subject` |
| Initial email | `initialBody` | `initialBody` |
| Number of follow-ups | `numberOfFollowUps` | `followupCount` |
| Gap between sends | `gapDays` | `gapDays` |
| Preferred send hour | `preferredHour` | `preferredHour` (integer 6–17) |

Schedule preview is computed client-side: `now + (seq * gapDays) days` at `preferredHour:00`. On submit, navigates to `/campaigns/:id` with the created campaign's ID.

Guard: `if (!userId) return` — prevents submit if somehow logged out mid-session.

---

### CampaignDetailPage — `/campaigns/:id`
**File:** `src/pages/CampaignDetailPage.tsx`

Fetches `api.getCampaign(id)` on mount. Renders:
- Stats strip (follow-ups sent/total, next send date, pending, failed)
- `<Timeline>` with initial email + all follow-ups
- Campaign metadata card (recipient, status, created, ID)
- Actions card: Pause (if ACTIVE) / Resume (if PAUSED) / Cancel remaining (button exists, wired up as `disabled` — no backend endpoint yet)

`handlePause` / `handleResume` call `api.pauseCampaign` / `api.resumeCampaign` and update local state with the returned campaign.

---

## Layout

### AppLayout
**File:** `src/components/layout/AppLayout.tsx`

```tsx
<div className="app">        // grid: sidebar-w | 1fr
  <Sidebar />
  <div className="main">
    <Outlet />               // page content renders here
  </div>
</div>
```

---

### Sidebar
**File:** `src/components/layout/Sidebar.tsx`

- Brand mark (C logo)
- Nav links: Campaigns (`/campaigns`) + New campaign (`/campaigns/new`). Active state detected via `useLocation().pathname`.
- User chip at the bottom: shows initials avatar, display name (derived from email local part), email, and a sign-out button that calls `useAuth().logout()`.

---

## UI Primitives

### Badge / campaignBadge / followupBadge
**File:** `src/components/ui/Badge.tsx`

```tsx
<Badge variant="active" />       // green
<Badge variant="paused" />       // amber
<Badge variant="completed" />    // gray
<Badge variant="failed" />       // red
<Badge variant="pending" />      // gray
<Badge variant="processing" />   // blue
<Badge variant="sent" />         // green
```

Helper functions for typed usage:
```tsx
campaignBadge(campaign.status)   // CampaignStatus → <Badge>
followupBadge(followup.status)   // FollowupStatus → <Badge>
```

---

### AiTag
**File:** `src/components/ui/AiTag.tsx`

Inline `<span>` with a sparkle SVG and "AI" text in accent color. Used on follow-up cards and the schedule preview header to signal AI-generated content. No props.

---

### Spinner
**File:** `src/components/ui/Spinner.tsx`

`<span className="spinner">` — CSS-animated border-top spinner. No props. Used in loading states across all pages.

---

## Timeline
**File:** `src/components/Timeline.tsx`

```tsx
type TimelineEntry =
  | { kind: 'initial'; sentAt: string; body: string }
  | { kind: 'followup'; followup: Followup };

<Timeline entries={entries} />
```

Renders a vertical rail with nodes (circle) and cards. Node color reflects status:
- SENT → green
- PROCESSING → blue
- FAILED → red
- PENDING → default gray with sequence number

**Note:** for SENT follow-ups, `scheduledAt` is shown as the send time (no `sentAt` column exists on the backend).

Used in both `CampaignDetailPage` (real data) and `CreateCampaignPage` (preview with static placeholder text).
