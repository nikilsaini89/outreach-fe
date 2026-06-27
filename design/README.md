# ColdEmailer — Frontend Design

High-fidelity, self-contained HTML/CSS mockups for the ColdEmailer frontend.
Visual direction: **Linear / Stripe** (calm neutral grays, one restrained indigo accent,
crisp small type, subtle borders over heavy shadows). Built to *not* read as a stock
AI-generated SaaS template, and to be a direct reference when we build the React app.

## How to view

Open `index.html` in any browser — it links every screen. No build step, no dependencies
(fonts load from Google Fonts; works offline with a system fallback).

## Screens

| File | Screen | Backend mapping |
|------|--------|-----------------|
| `login.html` | Google sign-in | `GET /oauth/google/login` → consent → `GET /oauth/google/callback` |
| `dashboard.html` | Campaign list + stats | `GET /campaigns` (list); status badges from `CampaignStatus` |
| `dashboard-empty.html` | First-run empty state | — |
| `create-campaign.html` | New campaign form + schedule preview | `POST /campaigns` — maps to `CreateCampaignRequest` |
| `campaign-detail.html` | Thread timeline + pause/resume/cancel | `GET /campaigns/{id}`, `POST /campaigns/{id}/pause`, `/resume` |

## Field mapping (Create campaign → `CreateCampaignRequest`)

| Form control | DTO field |
|--------------|-----------|
| Recipient email | `recipientEmail` |
| Subject | `subject` |
| Initial email (textarea) | `initialBody` |
| Number of follow-ups (stepper) | `followupCount` |
| Gap between sends (days) | `gapDays` |
| Preferred send hour (select) | `preferredHour` |

`userId` comes from the authenticated session, not the form.

## Status → badge classes

- `CampaignStatus`: ACTIVE → `badge-active`, PAUSED → `badge-paused`, COMPLETED → `badge-completed`, FAILED → `badge-failed`
- `FollowupStatus`: PENDING → `badge-pending`, PROCESSING → `badge-processing`, SENT → `badge-sent`, FAILED → `badge-failed`

## Import into Figma

1. In Figma, install the free **html.to.design** plugin.
2. Run it → *Import from code/file* → paste a screen's HTML (or its URL if served locally).
3. It rebuilds the screen as fully editable Figma layers, inheriting the tokens below.

To serve locally for URL import: `cd design && python3 -m http.server 8000` then use `http://localhost:8000/dashboard.html`.

## Design tokens

All defined as CSS variables in `styles.css` (`:root`) — these become the React theme on day one:

- **Color:** cool gray ramp (`--gray-25…900`), indigo accent (`--accent-500` `#5b5bd6`), status hues (green/amber/red/blue).
- **Type:** Inter; scale `--text-xs 12` → `--text-3xl 32`.
- **Spacing:** 4px base (`--s-1…12`).
- **Radii:** `--r-sm 6` → `--r-xl 16`, `--r-pill`.
- **Elevation:** four soft shadow steps.

## Notes / status

- The current backend `CampaignController` implements `POST /campaigns` only. List, detail,
  pause, and resume are specified in `DESIGN.md` and designed here so the UI is complete; they
  need controller endpoints when we wire the React app.
- `scheduledAt` on follow-ups is shown in the UI; `DESIGN.md` notes the `followups` table doesn't
  carry it yet — align the API before binding the timeline's scheduled times.
