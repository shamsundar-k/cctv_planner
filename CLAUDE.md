# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Run everything (frontend + backend in parallel)
```bash
pnpm dev
```

### Frontend only
```bash
pnpm dev:frontend          # Vite dev server on :5173
pnpm --filter frontend lint
pnpm --filter frontend build  # tsc -b + vite build
```

### Backend only
```bash
pnpm dev:backend           # uvicorn with --reload on :8000
# or directly:
cd packages/backend && uv run uvicorn app.main:app --reload
```

### Backend tests
```bash
cd packages/backend
uv run pytest                          # all tests
uv run pytest tests/test_auth_routes.py  # single file
```

Backend tests start a real uvicorn server (see `conftest.py`) and hit a real MongoDB/Redis — no mocks.

---

## Architecture

### Monorepo layout
```
packages/
  frontend/   React 19 + TypeScript + Vite + Tailwind v4
  backend/    FastAPI + Motor/Beanie (MongoDB) + Redis
```

Vite proxies `/api/*` → `localhost:8000` and `/ws` → WebSocket.

---

### Frontend

**Routing** (`src/App.tsx`)
Three route groups, each with their own wrapper:
- `<ProtectedRoute>` — authenticated users (Dashboard, ProjectMapView, ProjectManage)
- `<AdminRoute>` — admin role only (nested inside ProtectedRoute)
- `<PublicOnlyRoute>` — redirects authenticated users away (Login, AcceptInvite)

**Feature folders** (`src/features/<feature>/`)
Each feature owns its `components/`, `hooks/`, `api/`, and `types/`. Pages in `src/pages/` are thin shells that import from feature folders.

**State management**
- Zustand slices in `src/store/` hold client-side UI state (persisted auth tokens, map viewport, drawing mode, layer visibility).
- TanStack React Query handles all server state (caching, background refetch).

**HTTP / Auth**
- Axios instance in `src/api/client.ts` — base URL from `VITE_API_BASE_URL` or `/api/v1`.
- Interceptors in `src/api/interceptors.ts` (registered as a side-effect in `main.tsx`):
  - Request: attaches `Authorization: Bearer <accessToken>` from `authSlice`.
  - Response: on 401, queues in-flight requests, calls `POST /auth/refresh`, retries all queued requests.

**Theming**
A custom Vite plugin (`injectTheme()` in `vite.config.ts`) injects CSS custom-property tokens into the HTML `<head>` at build time. All component styles reference `var(--theme-*)` tokens — avoid hardcoded colour values.

---

### Backend

**Entry point:** `app/main.py` — registers routers under `/api/v1`, initialises Beanie (MongoDB ODM) and Redis in the lifespan context.

**Routers** (`app/routers/`)
| File | Prefix | Responsibility |
|------|--------|----------------|
| `auth.py` | `/auth` | Login, refresh, logout, invite acceptance |
| `projects.py` | `/projects` | Project CRUD, camera instances, zones |
| `camera_models.py` | `/camera-models` | Reusable camera spec CRUD |
| `admin.py` | `/admin` | User listing, invite generation |

**Auth flow**
1. Login → `{access_token (15 min), refresh_token (7 days)}`.
2. Refresh tokens are stored in Redis; logout revokes them.
3. Invite tokens are hashed + stored in MongoDB with a 72-hour TTL.

**FastAPI dependencies** (`app/core/deps.py`)
- `get_current_user` — decodes JWT, returns `User` document.
- `require_admin` — asserts `user.system_role == "admin"`.
Inject these into route handlers; don't reimplement auth checks inline.

**Database models** (`app/models/`)
Beanie documents. `Project` links to `User` via a `Link[User]` field; resolve it when needed rather than assuming it's populated.

**Config** (`app/core/config.py`)
Pydantic `BaseSettings` reads from `.env.local`. Key vars: `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `FIRST_ADMIN_EMAIL/PASSWORD`.
