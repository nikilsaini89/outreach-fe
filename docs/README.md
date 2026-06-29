# Frontend Knowledge Base

Agent guide: read the file that matches your task. You rarely need more than two files.

| File | Read when you need to… |
|---|---|
| [architecture.md](architecture.md) | Understand file structure, routing tree, or how pages compose |
| [auth.md](auth.md) | Trace the login flow, understand token storage, or debug auth state |
| [api-client.md](api-client.md) | Find an API method signature, understand 401 handling, or add a new call |
| [components.md](components.md) | Find a component, understand its props, or know where to add UI |
| [styling.md](styling.md) | Look up a CSS class, design token, or understand layout conventions |

## Stack at a glance

- **React 19** + **TypeScript 5.7** + **Vite 6**
- **Tailwind v4** via `@tailwindcss/vite` plugin (no config file — tokens are CSS custom properties in `src/styles/index.css`)
- **react-router-dom v7** for client-side routing
- **No component library** — all UI is hand-built with CSS classes defined in `index.css`
- **No state management library** — auth state via React Context; page data via local `useState` + `useEffect`

## Dev server

```bash
npm run dev          # Vite on http://localhost:5173
npm run typecheck    # tsc --noEmit (no emit, just type check)
npm run build        # tsc -b && vite build
```

The Vite dev server proxies `/campaigns`, `/oauth/google/login`, and `/oauth/google/callback` to `http://localhost:8080` (override with `BACKEND_URL` env var). A `bypass` rule ensures browser navigations to `/campaigns/*` get `index.html`, not raw API JSON.
