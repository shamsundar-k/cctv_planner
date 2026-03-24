# CCTV Survey Planner — Project Summary

> Generated: 2026-03-24

---

## 1. Overview

**CCTV Survey Planner** is a full-stack web application for planning and documenting CCTV camera deployments. Users create survey projects, place virtual cameras on an interactive map, and evaluate coverage quality using two-stage geometric and photometric calculations aligned with **IEC EN 62676-4:2015**.

**Core workflow:**
1. Admin seeds the system with reusable camera hardware models (lens specs, sensor specs).
2. Users create a project, import the camera models they need, and place camera instances on the map.
3. Each placed camera has configurable installation parameters (height, tilt, bearing, focal length).
4. The app computes a **Stage 1** FOV trapezoid (geometric ground footprint) and **Stage 2** DORI performance metrics (Detection / Observation / Recognition / Identification threshold distances), displayed live on the map.

---

## 2. Monorepo Structure

Managed with **pnpm workspaces** (`pnpm-workspace.yaml`).

```
cctv_planner/
├── packages/
│   ├── frontend/          React 19 + TypeScript + Vite 7
│   └── backend/           Python 3.12 + FastAPI + MongoDB + Redis
├── docs/                  Design docs, data models, diagrams
├── CLAUDE.md              Developer guidance for Claude Code
├── .env.example           Environment variable template
└── package.json           Root convenience scripts
```

**Root commands:**

| Command | Description |
|---|---|
| `pnpm dev:frontend` | Vite dev server on port 5173 |
| `pnpm dev:backend` | FastAPI (uvicorn) on port 8000 |

Vite proxies `/api/*` → `localhost:8000` and `/ws/*` → `ws://localhost:8000` during development — no CORS config required.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19, React Router v7 |
| Frontend build | Vite 7, Tailwind CSS v4, TypeScript |
| State management | Zustand (UI/global), TanStack Query v5 (server state) |
| HTTP client | Axios with JWT-refresh interceptor |
| Mapping | Leaflet + leaflet-draw, Stadia Maps basemap |
| Backend framework | FastAPI + Uvicorn |
| Backend language | Python 3.12 |
| Database | MongoDB (Motor async driver + Beanie ODM) |
| Cache / sessions | Redis (asyncio) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| PDF export (deferred) | weasyprint |
| KML export (deferred) | simplekml |

---

## 4. Frontend

### Pages & Routing

| Route | Page | Purpose |
|---|---|---|
| `/login` | `LoginPage` | Email/password login |
| `/accept-invite` | `AcceptInvitePage` | Accept invite → create account |
| `/` | `DashboardPage` | Project list (filter, sort, search) |
| `/projects/:id` | `ProjectMapViewPage` | Full-screen map editor |
| `/admin/manage` | `AdminPage` | Admin guard |
| `/admin/manage/cameras` | `AdminCamerasPage` | Camera model CRUD |
| `/admin/manage/cameras/new` | `AdminCameraEditPage` | Create camera model |
| `/admin/manage/cameras/:id/edit` | `AdminCameraEditPage` | Edit camera model |

### Map View Layout (`ProjectMapViewPage`)

The map view is composed of five regions:

```
┌─────────────────────────────────────────────────────────┐
│  MapNavbar (project name, save, user menu)              │
├──────────┬──────────────────────────────────┬───────────┤
│          │                                  │           │
│  Left    │       MapCanvas (Leaflet)         │  Camera   │
│ Sidebar  │  ├─ CameraLayer (SVG icons)       │ Properties│
│ (236px)  │  └─ FovLayer (FOV + DORI rings)  │  Panel    │
│          │                                  │           │
├──────────┴──────────────────────────────────┴───────────┤
│  BottomToolbar (tool selection buttons)                 │
└─────────────────────────────────────────────────────────┘
```

**Left Sidebar tabs:**
- **Cameras** — list of camera instances; click to select, toggle visibility per camera
- **Layers** — global toggles for FOV polygons, zone polygons, camera labels; basemap style selector
- **Models** — choose an imported camera model to use with the "Place Camera" tool

**BottomToolbar tools:** Pan · Select · Place Camera · Draw Polygon · Draw Line · Measure · Delete

### State Management (Zustand)

| Store | Persistence | Key State |
|---|---|---|
| `authSlice` | localStorage | `user`, `accessToken`, `refreshToken` |
| `projectSlice` | None (session) | `filterType`, `sortBy`, `searchQuery` |
| `mapViewSlice` | None (session) | `activeTool`, `selectedCameraId`, `selectedModelId`, visibility toggles, `isDirty` |

### FOV Calculations (`lib/fovCalculations.ts`)

All Stage 1 geometry runs entirely on the frontend for real-time feedback.

**Inputs:** camera height (H), tilt angle, horizontal/vertical FOV angles (interpolated from focal length), bearing.

**Outputs (`FovResult`):**
- `dNear`, `dFar` — near/far ground distances
- `wNear`, `wFar` — trapezoid widths at near/far edges
- `area` — trapezoid area (m²)
- `corners` — four lat/lng vertices for map polygon rendering

**Interpolation:** Linear between `h_fov_min`↔`h_fov_max` and `v_fov_min`↔`v_fov_max` based on `focal_length_chosen` within the model's range.

---

## 5. Backend

### API Routes

Base path: `/api/v1`

#### Auth (`/auth`)

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Email + password → JWT pair |
| POST | `/refresh` | Public | Rotate refresh token → new JWT pair |
| POST | `/logout` | Public | Revoke refresh token |
| GET | `/accept-invite` | Public | Preview invite (email, expiry) |
| POST | `/accept-invite` | Public | Create account from invite link |

#### Admin (`/admin`)

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/invite` | Admin | Create invite link |
| GET | `/invites` | Admin | List pending invites |
| DELETE | `/invites/:id` | Admin | Revoke invite |
| GET | `/users` | Admin | List all users |
| DELETE | `/users/:id` | Admin | Delete user |

#### Camera Models (`/camera-models`)

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Any user | List all models |
| POST | `/` | Admin | Create model |
| GET | `/:id` | Any user | Get single model |
| PUT | `/:id` | Admin | Update model |
| DELETE | `/:id` | Admin | Delete model |

#### Projects (`/projects`)

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Owner / Admin | List projects |
| POST | `/` | Any user | Create project |
| GET | `/:id` | Owner | Full project + cameras + zones |
| PUT | `/:id` | Owner | Update project metadata |
| DELETE | `/:id` | Owner | Delete project (cascade) |
| GET | `/:id/camera-models` | Owner | Imported models + placement counts |
| POST | `/:id/camera-models/:model_id` | Owner | Import model into project |
| DELETE | `/:id/camera-models/:model_id` | Owner | Remove model import |
| POST | `/:id/cameras` | Owner | Place camera instance |
| PUT | `/:id/cameras/:cam_id` | Owner | Update camera instance |
| DELETE | `/:id/cameras/:cam_id` | Owner | Delete camera instance |

### Data Models (MongoDB / Beanie)

#### `User`
```
email            (unique)
full_name
hashed_password
system_role      admin | user
created_at
```

#### `CameraModel`
```
name, manufacturer, model_number, camera_type, location, notes

Lens:
  focal_length_min / max (mm)
  h_fov_min / max (°)
  v_fov_min / max (°)
  lens_type, ir_cut_filter, ir_range (m)

Sensor:
  resolution_h / v (px), megapixels, aspect_ratio
  sensor_size, sensor_type
  min_illumination (lux), wdr, wdr_db

created_by (→ User), created_at, updated_at
Unique index: (name, created_by)
```

#### `CameraInstance`
```
project (→ Project)
camera_model (→ CameraModel)
label
lat, lng
bearing (° from North)
height (m)
tilt_angle (°)
focal_length_chosen (mm)
target_distance (m), target_height (m, default 1.5)
colour (hex), visible
fov_visible_geojson, fov_ir_geojson   ← stored GeoJSON computed by frontend
created_at, updated_at
```

#### `Project`
```
name, description
owner (→ User)
center_lat, center_lng, default_zoom
imported_camera_model_ids  []
created_at, updated_at
Unique index: (owner, name)
```

#### `Zone`
```
project (→ Project)
label, zone_type (polygon | line | point), colour, visible
geojson (GeoJSON Polygon or LineString)
created_at, updated_at
```

#### `InviteToken`
```
token_hash (SHA-256 of raw URL-safe base64 token)
email, invited_by (→ User)
used (bool), expires_at, created_at
```

### Auth Design

- **Access token**: Short-lived JWT (default 15 min), signed with `JWT_SECRET`. Payload: `sub=user_id`, `role`.
- **Refresh token**: Long-lived (default 7 days), stored as hash in Redis with TTL. Rotated on every `/refresh` call — old token revoked immediately.
- **Dependency injection**: `get_current_user` validates Bearer JWT; `require_admin` additionally checks `system_role == "admin"`.

---

## 6. Implementation Status

| Feature | Status | Notes |
|---|---|---|
| Auth (login / invite / refresh / logout) | ✅ Complete | Token rotation, Redis-backed |
| Admin dashboard (users, invites) | ✅ Complete | |
| Camera model CRUD | ✅ Complete | Lens geometry validation, MP auto-calc |
| Project CRUD + dashboard | ✅ Complete | Filter, sort, search |
| Map view shell (layout, navbar, sidebar, toolbar) | ✅ Complete | Milestones 1–3 done |
| Camera placement on map | ✅ Complete | Click-to-place, drag-to-move |
| Stage 1 FOV calculation | ✅ Complete | Real-time trapezoid geometry |
| FOV polygon rendering on map | ⚠️ In progress | Milestone 4/5 |
| DORI metrics display (Stage 2) | ⚠️ In progress | Calculations done; UI being built |
| Camera properties panel | ⚠️ In progress | Position, bearing, height, focal length |
| Zone drawing (polygon / line) | ❌ API only | Endpoints exist; no UI yet |
| Measure tool | ❌ Not started | Deferred |
| PDF / KML export | ❌ Not started | Backend deps installed |
| Real-time collaboration (WebSocket) | ❌ Deferred | Planned for v2 |
| Undo / Redo | ❌ Not started | Planned |

---

## 7. Configuration

### Backend environment variables

| Variable | Purpose | Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | — |
| `REDIS_URL` | Redis connection string | — |
| `JWT_SECRET` | JWT signing key | — |
| `JWT_ACCESS_TTL_MINUTES` | Access token lifetime | 15 |
| `JWT_REFRESH_TTL_DAYS` | Refresh token lifetime | 7 |
| `INVITE_TOKEN_TTL_HOURS` | Invite link lifetime | 72 |
| `FIRST_ADMIN_EMAIL` | Seeded admin account | — |
| `FIRST_ADMIN_PASSWORD` | Seeded admin password | — |
| `FRONTEND_BASE_URL` | Used in invite URLs | `http://localhost:5173` |

### Frontend environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base path (default `/api/v1`) |
| `VITE_WS_BASE_URL` | WebSocket base path (default `/ws`) |
| `VITE_STADIA_MAPS_API_KEY` | Basemap tile API key |

---

## 8. Key Design Decisions

| Decision | Rationale |
|---|---|
| FOV calculation on frontend | Enables real-time slider feedback with no network round-trip |
| GeoJSON stored on CameraInstance | Persists computed coverage for offline/readonly views |
| Refresh token rotation | Security: compromised token is revoked after first use |
| Beanie ODM + Motor | Type-safe async MongoDB; automatic index creation |
| pnpm workspaces | Unified tooling and simultaneous dev of both packages |
| Admin-only model management | Camera hardware specs are shared/curated, not per-user |
| Owner-only project access | Projects are private by default; collaboration deferred to v2 |

---

## 9. Key Source Files

### Frontend
| File | Purpose |
|---|---|
| `src/pages/ProjectMapViewPage.tsx` | Map editor entry point |
| `src/components/map/LeftSidebar.tsx` | Sidebar with Cameras / Layers / Models tabs |
| `src/components/map/CameraPropertiesPanel.tsx` | Camera config panel |
| `src/components/map/BottomToolbar.tsx` | Tool selection |
| `src/lib/fovCalculations.ts` | Stage 1 FOV geometry |
| `src/store/mapViewSlice.ts` | Map UI state |
| `src/api/projects.ts` | Project + camera instance API hooks |

### Backend
| File | Purpose |
|---|---|
| `app/main.py` | FastAPI app + lifespan |
| `app/models/camera_model.py` | CameraModel document |
| `app/models/camera_instance.py` | CameraInstance document |
| `app/routers/projects.py` | Project + camera instance endpoints |
| `app/routers/auth.py` | Auth endpoints |
| `app/core/config.py` | Settings (pydantic-settings) |
| `app/core/database.py` | MongoDB + Redis init |
| `app/core/security.py` | JWT + password helpers |
| `app/core/deps.py` | `get_current_user`, `require_admin` |

---

## 10. Related Documentation

| File | Description |
|---|---|
| `docs/frontend/UI design/map-view-milestones.md` | Detailed 6-milestone roadmap for the map editor |
| `docs/frontend/UI design/map-view-design.md` | Component tree and UI design spec |
| `docs/backend/data-models/camera_model.md` | Camera model field spec + Stage 1/2 formulas |
| `docs/backend/data-models/mongodb-collections.mmd` | MongoDB collection diagram |
| `docs/backend/API structure.mmd` | API structure diagram |
| `docs/process/CCTV_Stage1_Stage2_DORI-1.pdf` | IEC EN 62676-4:2015 DORI reference |
| `docs/process/CCTV_Coverage_Calculation.pdf` | Coverage calculation methodology |
