# outreach-fe

Frontend for **ColdEmailer** — the Gmail-native cold-outreach app
([backend repo](../ColdEmailer)).

## Status

`design/` holds high-fidelity HTML/CSS mockups of every screen (Linear/Stripe
visual direction). They are the reference for the React build that will live at
the root of this repo. See [`design/README.md`](design/README.md) for the screen
list, backend API mapping, and how to import the mockups into Figma.

## Screens

Open `design/index.html` in a browser — it links every screen:

- Login (Google OAuth)
- Dashboard / campaign list (+ empty state)
- Create campaign
- Campaign detail (follow-up timeline, pause/resume)

## Backend

API contract is defined in the ColdEmailer Spring Boot service:

- `GET  /campaigns?userId={uuid}` — list campaigns
- `GET  /campaigns/{id}` — campaign detail
- `POST /campaigns` — create campaign
- `POST /campaigns/{id}/pause` · `POST /campaigns/{id}/resume`
- `GET  /oauth/google/login` · `GET /oauth/google/callback`
