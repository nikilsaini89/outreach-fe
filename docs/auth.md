# Auth

## Login flow

```
User clicks "Continue with Google"
  → LoginPage calls login()
  → fetch GET /oauth/google/login  (proxied to backend)
  → backend returns JSON string: "https://accounts.google.com/..."
  → window.location.href = authUrl  (full-page redirect to Google)

User consents on Google
  → Google redirects to backend: GET /oauth/google/callback?code=...
  → backend issues JWTs, redirects 302 to:
    http://localhost:5173/?authToken=<jwt>&refreshToken=<jwt>

Browser lands on /?authToken=...&refreshToken=...
  → AuthProvider useState initializer runs consumeOAuthParams() synchronously
  → reads authToken + refreshToken from URL
  → stores both in localStorage (ce_authToken, ce_refreshToken)
  → clears URL with window.history.replaceState
  → React state: authToken = <jwt>
  → userId / userEmail derived from decodeJwtClaims(authToken)
  → RequireAuth sees userId !== null → renders protected routes
  → RootRedirect sends to /campaigns
```

**Why synchronous init?** `RequireAuth` reads `userId` during the first render. If `consumeOAuthParams()` ran in a `useEffect`, there would be one render tick where `userId` is null, causing `RequireAuth` to redirect to `/login` before the token is consumed.

## localStorage keys

| Key | Value | Set by |
|---|---|---|
| `ce_authToken` | Signed JWT (24h expiry) | `consumeOAuthParams()` on login; `refreshAuthToken()` on token refresh |
| `ce_refreshToken` | Signed JWT (30d expiry) | `consumeOAuthParams()` on login |

## JWT claims decoded on the frontend

```ts
function decodeJwtClaims(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}
```

- `claims['sub']` → `userId` (UUID string)
- `claims['email']` → `userEmail`

No signature verification on the frontend — the backend validates the signature on every API call.

## Token refresh

When any API call returns 401, `api.ts` automatically tries to refresh:

```
api call returns 401
  → refreshAuthToken()
  → POST /auth/refresh { refreshToken: localStorage.ce_refreshToken }
  → if 200: store new authToken in localStorage, retry original request
  → if not 200: dispatch window CustomEvent('auth:expired')
                → AuthProvider listener clears ce_authToken + ce_refreshToken
                → sets authToken state to null
                → userId becomes null
                → RequireAuth redirects to /login
```

## AuthContext API

```ts
const { userId, userEmail, login, logout } = useAuth();
```

| Field | Type | Notes |
|---|---|---|
| `userId` | `string \| null` | UUID from JWT `sub` claim; null when not logged in |
| `userEmail` | `string \| null` | from JWT `email` claim; displayed in Sidebar |
| `login()` | `() => Promise<void>` | fetches auth URL, redirects to Google |
| `logout()` | `() => void` | clears localStorage + React state |

## What NOT to store in context

`authToken` itself is intentionally not exposed via context. `api.ts` reads `localStorage.ce_authToken` directly, so there's no circular dependency and no need to thread the token through props.
