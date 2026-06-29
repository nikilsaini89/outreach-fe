# Architecture

## File structure

```
src/
├── main.tsx                      Entry point — mounts <App /> in StrictMode
├── App.tsx                       Router + AuthProvider + route tree
├── vite-env.d.ts                 Declares VITE_API_BASE_URL env var type
│
├── types/
│   └── api.ts                    All shared TS types (Campaign, Followup, enums, request shapes)
│
├── context/
│   └── AuthContext.tsx           JWT auth state — provides userId, userEmail, login(), logout()
│
├── lib/
│   └── api.ts                    HTTP client — all backend calls go through here
│
├── pages/
│   ├── LoginPage.tsx             /login — Google sign-in button
│   ├── DashboardPage.tsx         /campaigns — campaign list + stats
│   ├── CreateCampaignPage.tsx    /campaigns/new — create form + schedule preview
│   └── CampaignDetailPage.tsx    /campaigns/:id — timeline + pause/resume actions
│
├── components/
│   ├── Timeline.tsx              Email thread timeline (initial + follow-ups)
│   ├── layout/
│   │   ├── AppLayout.tsx         Shell: sidebar + <Outlet />
│   │   └── Sidebar.tsx           Nav links + user chip + logout
│   └── ui/
│       ├── Badge.tsx             Status badges for Campaign and Followup
│       ├── AiTag.tsx             "AI" sparkle tag used on AI-generated content
│       └── Spinner.tsx           Loading spinner
│
└── styles/
    └── index.css                 All CSS: design tokens, layout, components
```

## Route tree

```
/                     → RootRedirect (→ /campaigns if logged in, → /login if not)
/login                → LoginPage (public)
│
└── <RequireAuth>     Guards all routes below; redirects to /login if userId is null
    └── <AppLayout>   Renders sidebar + <Outlet />
        ├── /campaigns          → DashboardPage
        ├── /campaigns/new      → CreateCampaignPage
        └── /campaigns/:id      → CampaignDetailPage

*                     → Navigate to /
```

`RequireAuth` is a layout route that renders `<Outlet />` when `userId !== null`, or `<Navigate to="/login" />` otherwise. It reads `userId` from `useAuth()` which is synchronously initialized from either the URL `?authToken=` param or `localStorage`.

## Data flow

```
AuthProvider (context)
  └── userId, userEmail  ← derived from JWT claims decoded in useState initializer
       └── RequireAuth reads userId to decide whether to render or redirect
            └── DashboardPage / CreateCampaignPage call useAuth() for userId guard
                 └── api.ts reads ce_authToken from localStorage for every request
```

## Key design decisions

- **No Redux / Zustand** — auth is one context; page-level state is local `useState`.
- **No axios** — native `fetch` with a thin `request<T>()` wrapper in `api.ts`.
- **No Tailwind class utilities in JSX** — all styling is via named CSS classes (`btn`, `card`, `badge-active`, etc.) defined in `index.css`. Tailwind is only used for its `@import "tailwindcss"` reset layer.
- **Types co-located with API** — `src/types/api.ts` mirrors the backend DTOs exactly. Update it when backend DTOs change.
- **Inline SVG icons** — no icon library; icons are small inline `<svg>` constants inside the file that uses them.
