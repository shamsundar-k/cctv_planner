# CCTV Survey Planner — Milestones & Tasks

**Project:** CCTV Survey Planner  
**Version:** 1.0  
**Last Updated:** March 2026

---

## How to Use This File

- Check off tasks as you complete them `[x]`
- Each milestone has an exit criterion — don't move to the next milestone until it passes
- Tasks are ordered by dependency — follow them top to bottom within each milestone

---

## Milestone 1 — Foundation
> **Goal:** Auth works end-to-end. Admin can log in, generate an invite, new user can register and log in.

### M1.1 — Project Scaffold
- [x] Create monorepo root folder (`cctv-survey-planner`)
- [x] Initialise git (`git init`)
- [x] Create `pnpm-workspace.yaml`
- [x] Create root `package.json` with dev scripts
- [x] Create `.gitignore`
- [x] Create `.env.example` with all required keys

### M1.2 — Frontend Scaffold
- [x] Scaffold React + Vite + TypeScript app in `packages/frontend`
- [x] Install dependencies (Leaflet, Axios, React Query, Zustand, React Router)
- [x] Configure Tailwind CSS
- [x] Configure Vite proxy (`/api` → `localhost:8000`, `/ws` → `ws://localhost:8000`)

### M1.3 — Backend Scaffold
- [x] Initialise UV project in `packages/backend`
- [x] Pin Python 3.12 (`uv python pin 3.12`)
- [x] Create virtual environment (`uv venv`)
- [x] Install all backend dependencies (FastAPI, Beanie, Redis, Shapely, etc.)
- [x] Install dev dependencies (pytest, httpx)
- [x] Create backend folder structure (`routers`, `models`, `schemas`, `services`, `core`)
- [x] Create minimal `app/main.py` with `/api/v1/health` route
- [x] Verify both services start (`uvicorn` + `pnpm dev`)

### M1.4 — Config & Database Connection
- [ ] Create `app/core/config.py` — Pydantic settings model reading from `.env.local`
- [ ] Create `app/core/database.py` — MongoDB connection via Beanie + Redis async client
- [ ] Wire database startup/shutdown into `app/main.py` lifespan
- [ ] Verify MongoDB Atlas connection on startup (log confirmation)
- [ ] Verify Redis Cloud connection on startup (log confirmation)

### M1.5 — Beanie Document Models
- [ ] Create `app/models/user.py` — `User` document
- [ ] Create `app/models/invite_token.py` — `InviteToken` document
- [ ] Create `app/models/camera_model.py` — `CameraModel` document
- [ ] Create `app/models/project.py` — `Project` document
- [ ] Create `app/models/camera_instance.py` — `CameraInstance` document
- [ ] Create `app/models/zone.py` — `Zone` document
- [ ] Register all models in Beanie initialisation
- [ ] Write and run a seed script to insert one test document of each type
- [ ] Verify all documents appear in MongoDB Atlas dashboard

### M1.6 — Security Utilities
- [ ] Create `app/core/security.py`
- [ ] Implement `hash_password(plain: str) → str` using passlib bcrypt
- [ ] Implement `verify_password(plain: str, hashed: str) → bool`
- [ ] Implement `create_access_token(user_id: str, role: str) → str` (JWT, 15min TTL)
- [ ] Implement `create_refresh_token() → str` (random 32-byte URL-safe string)
- [ ] Implement `decode_access_token(token: str) → dict` (raises on invalid/expired)
- [ ] Create `app/core/deps.py` — `get_current_user` FastAPI dependency (extracts + validates JWT)
- [ ] Create `app/core/deps.py` — `require_admin` dependency (checks system_role == admin)
- [ ] Unit test all security functions in `tests/test_security.py`

### M1.7 — Auth Routes
- [ ] Create `app/routers/auth.py`
- [ ] Implement `POST /api/v1/auth/login` — validate credentials, return access + refresh tokens
- [ ] Implement `POST /api/v1/auth/refresh` — validate refresh token from Redis, return new access token
- [ ] Implement `POST /api/v1/auth/logout` — delete refresh token from Redis
- [ ] Store refresh token hash in Redis with 7-day TTL on login
- [ ] Register auth router in `app/main.py`
- [ ] Test all three routes manually (curl or Postman)

### M1.8 — Invite Flow
- [ ] Create `app/routers/admin.py`
- [ ] Implement `POST /api/v1/admin/invite` — generate invite token, store hash in MongoDB, return invite URL
- [ ] Implement `GET /api/v1/admin/users` — list all users (admin only)
- [ ] Add invite acceptance routes to `app/routers/auth.py`
- [ ] Implement `GET /api/v1/auth/accept-invite?token=...` — validate token, return email
- [ ] Implement `POST /api/v1/auth/accept-invite` — create User, mark token used, return tokens
- [ ] Register admin router in `app/main.py`
- [ ] Test full invite flow manually end-to-end

### M1.9 — First Admin Seed
- [ ] Create `app/core/seed.py` — `seed_first_admin()` function
- [ ] On FastAPI startup: check if any admin user exists; if not, create from `FIRST_ADMIN_EMAIL` + `FIRST_ADMIN_PASSWORD` env vars
- [ ] Log a warning if default admin password is still set to `admin123`
- [ ] Test: fresh database → startup → admin account exists

### M1.10 — Frontend Auth UI
- [ ] Create `src/store/authSlice.ts` — Zustand slice (user, access token, set/clear)
- [ ] Create `src/api/client.ts` — Axios instance with base URL
- [ ] Create `src/api/interceptors.ts` — attach access token to requests; on 401, call refresh and retry
- [ ] Create `src/pages/LoginPage.tsx` — email + password form, calls `POST /auth/login`
- [ ] Create `src/components/ProtectedRoute.tsx` — redirects unauthenticated users to `/login`
- [ ] Create `src/pages/AcceptInvitePage.tsx` — reads `?token=`, validates, shows registration form
- [ ] Set up React Router in `src/main.tsx` with `/login`, `/accept-invite`, and `/` (protected) routes
- [ ] Create placeholder `src/pages/DashboardPage.tsx` — just shows "Welcome, {name}" for now
- [ ] Test full flow: login → dashboard; unauthenticated → redirect to login; invite link → register → login

### ✅ Milestone 1 Exit Criterion
- [ ] Admin logs in successfully
- [ ] Admin generates an invite link via `POST /admin/invite`
- [ ] New user registers via invite link
- [ ] New user logs in successfully
- [ ] Axios interceptor silently refreshes expired access token
- [ ] Viewer of `/` without auth is redirected to `/login`

---

## Milestone 2 — Core Map Features
> **Goal:** User can place cameras on a map, adjust bearing and FOV parameters, and see FOV polygons update in real time.

### M2.1 — Camera Model CRUD (Backend)
- [ ] Create `app/schemas/camera_model.py` — request/response Pydantic schemas
- [ ] Create `app/routers/camera_models.py`
- [ ] Implement `GET /api/v1/camera-models` — list caller's models
- [ ] Implement `POST /api/v1/camera-models` — create model
- [ ] Implement `GET /api/v1/camera-models/{id}` — get single model
- [ ] Implement `PUT /api/v1/camera-models/{id}` — update model
- [ ] Implement `DELETE /api/v1/camera-models/{id}` — delete model
- [ ] Register router in `app/main.py`

### M2.2 — Project CRUD (Backend)
- [ ] Create `app/schemas/project.py` — request/response schemas
- [ ] Create `app/routers/projects.py`
- [ ] Implement `GET /api/v1/projects` — list projects where user is owner or collaborator
- [ ] Implement `POST /api/v1/projects` — create project
- [ ] Implement `GET /api/v1/projects/{id}` — full project (metadata + cameras + zones)
- [ ] Implement `PUT /api/v1/projects/{id}` — update metadata (owner/editor only)
- [ ] Implement `DELETE /api/v1/projects/{id}` — delete project and all children (owner only)
- [ ] Implement `POST /api/v1/projects/{id}/collaborators` — add collaborator
- [ ] Implement `DELETE /api/v1/projects/{id}/collaborators/{user_id}` — remove collaborator
- [ ] Register router in `app/main.py`

### M2.3 — GIS Service
- [ ] Create `app/services/gis.py`
- [ ] Implement `compute_fov_polygon(lat, lng, bearing, fov_angle, max_range, min_range) → dict` (GeoJSON Polygon)
- [ ] Handle `min_range > 0` case (5-point truncated polygon)
- [ ] Use `pyproj` geodesic for all distance/bearing calculations
- [ ] Write unit tests in `tests/test_gis.py` with known fixture inputs and expected outputs
- [ ] Test edge cases: bearing 0°, 180°, 360°, FOV angle 40°, 90°, 180°

### M2.4 — Camera Instance Routes (Backend)
- [ ] Create `app/schemas/camera_instance.py` — request/response schemas
- [ ] Create `app/routers/cameras.py`
- [ ] Implement `POST /api/v1/projects/{id}/cameras` — place camera; call GIS service inline; store `fov_geojson`
- [ ] Implement `PUT /api/v1/projects/{id}/cameras/{cam_id}` — update camera; recompute FOV inline
- [ ] Implement `DELETE /api/v1/projects/{id}/cameras/{cam_id}` — remove camera
- [ ] Enforce owner/editor role on all mutating routes
- [ ] Register router in `app/main.py`

### M2.5 — Project Dashboard (Frontend)
- [ ] Create `src/api/projects.ts` — React Query hooks (`useProjects`, `useProject`, `useCreateProject`)
- [ ] Create `src/pages/DashboardPage.tsx` — list of projects with name, last edited, open button
- [ ] Create `src/components/CreateProjectModal.tsx` — name + description form
- [ ] Route `/projects/:id` → `ProjectPage` (scaffold only for now)

### M2.6 — Map Canvas (Frontend)
- [ ] Install and configure Leaflet.js in `src/pages/ProjectPage.tsx`
- [ ] Render Stadia Maps tile layer using `VITE_STADIA_MAPS_API_KEY`
- [ ] Create `src/store/mapSlice.ts` — active tool, layer visibility toggles
- [ ] Create `src/components/map/MapCanvas.tsx` — Leaflet map container
- [ ] Create `src/components/layout/Navbar.tsx` — logo, project name, save button, user menu
- [ ] Create `src/components/layout/LeftPanel.tsx` — tabbed panel scaffold (Cameras, Zones, Layers, Models)
- [ ] Create `src/components/layout/BottomToolbar.tsx` — tool buttons (Place Camera, Draw Polygon, Draw Line, Select, Pan)

### M2.7 — Camera Placement & Editing (Frontend)
- [ ] Create `src/store/cameraSlice.ts` — cameras array, selected camera ID
- [ ] Create `src/api/cameras.ts` — React Query hooks (`usePlaceCamera`, `useUpdateCamera`, `useDeleteCamera`)
- [ ] Implement "Place Camera" tool — map click → show model selector popup → `POST /cameras` → add camera icon to map
- [ ] Render camera icon as directional SVG marker (rotated to bearing)
- [ ] Implement drag-to-move — `dragend` event → 300ms debounce → `PUT /cameras/{id}`
- [ ] Implement FOV polygon rendering — GeoJSON layer per camera, semi-transparent fill, per-camera colour
- [ ] Create `src/components/camera/CameraEditPanel.tsx` — label, model swap, bearing input, overrides, colour picker, visibility toggle, delete
- [ ] Implement bearing rotation handle on FOV arc → debounced `PUT /cameras/{id}`
- [ ] Implement per-camera FOV visibility toggle
- [ ] Implement global FOV show/hide toggle (Layers tab)
- [ ] Populate Cameras tab in left panel — list with visibility toggle, click to select + highlight

### ✅ Milestone 2 Exit Criterion
- [ ] User can create a project and open it
- [ ] User can place multiple cameras on the map
- [ ] User can drag cameras to reposition — FOV updates within 500ms
- [ ] User can rotate bearing — FOV updates within 500ms
- [ ] User can edit FOV angle and range overrides — FOV updates
- [ ] Per-camera and global FOV visibility toggles work
- [ ] Editor/viewer role permissions enforced on camera routes

---

## Milestone 3 — Zones, Collaboration & Save
> **Goal:** Zone drawing works. Two users editing the same project see each other's changes in real time.

### M3.1 — Zone Routes (Backend)
- [ ] Create `app/schemas/zone.py` — request/response schemas
- [ ] Create `app/routers/zones.py`
- [ ] Implement `POST /api/v1/projects/{id}/zones` — create zone
- [ ] Implement `PUT /api/v1/projects/{id}/zones/{zone_id}` — update zone
- [ ] Implement `DELETE /api/v1/projects/{id}/zones/{zone_id}` — delete zone
- [ ] Enforce owner/editor role on all mutating routes
- [ ] Register router in `app/main.py`

### M3.2 — WebSocket Manager (Backend)
- [ ] Create `app/services/websocket_manager.py` — room registry keyed by `project_id`
- [ ] Implement `connect(project_id, user_id, websocket)`
- [ ] Implement `disconnect(project_id, user_id)`
- [ ] Implement `broadcast(project_id, message, exclude_user_id)` — send to all except originator
- [ ] Store presence set in Redis (`presence:{project_id}` → set of user_ids)
- [ ] Create `app/routers/websocket.py` — `WS /ws/projects/{id}?token=...`
- [ ] Validate JWT on WebSocket upgrade; reject with close code 4001 if invalid
- [ ] Broadcast `user_joined` on connect, `user_left` on disconnect
- [ ] Wire camera and zone route handlers to broadcast after successful DB write
- [ ] Register WebSocket router in `app/main.py`

### M3.3 — Zone Drawing (Frontend)
- [ ] Install Leaflet.draw
- [ ] Create `src/store/zoneSlice.ts` — zones array, selected zone ID
- [ ] Create `src/api/zones.ts` — React Query hooks
- [ ] Implement polygon drawing tool — Leaflet.draw polygon → `POST /zones` on completion
- [ ] Implement polyline drawing tool — Leaflet.draw polyline → `POST /zones` on completion
- [ ] Render zones as GeoJSON layers (distinct z-order from FOV layers)
- [ ] Create `src/components/zone/ZoneEditPanel.tsx` — label, purpose, colour, delete
- [ ] Populate Zones tab in left panel — list with visibility toggle, click to select

### M3.4 — Real-Time Collaboration (Frontend)
- [ ] Create `src/hooks/useProjectWebSocket.ts` — connect on project open, reconnect with backoff on disconnect
- [ ] Handle `camera_updated` — merge updated camera into Zustand store, re-render FOV layer
- [ ] Handle `camera_added` — add camera to store, render on map
- [ ] Handle `camera_deleted` — remove camera from store and map
- [ ] Handle `zone_updated`, `zone_added`, `zone_deleted` — merge into zone store
- [ ] Handle `user_joined`, `user_left` — update presence list in `projectSlice`
- [ ] Create `src/components/layout/PresenceIndicators.tsx` — avatar initials in navbar for active collaborators

### M3.5 — Save & Auto-Save (Frontend)
- [ ] Implement auto-save — debounced push on every camera/zone mutation (changes already persisted via REST; auto-save updates `project.updated_at`)
- [ ] Create manual Save button in Navbar — calls `PUT /projects/{id}` with latest metadata
- [ ] Show last-saved timestamp in Navbar
- [ ] Show unsaved changes indicator when local state differs from server

### M3.6 — Collaborator Management (Frontend)
- [ ] Create `src/components/project/CollaboratorsModal.tsx` — search users by email, assign role, list current collaborators, remove collaborator
- [ ] Connect to `POST /projects/{id}/collaborators` and `DELETE /projects/{id}/collaborators/{user_id}`
- [ ] Hide edit controls for viewer-role users (UI courtesy; backend enforces)

### ✅ Milestone 3 Exit Criterion
- [ ] User can draw polygons and polylines on the map
- [ ] Zones are labelled, colour-coded, and listed in the left panel
- [ ] Two editors in the same project see each other's camera and zone changes within 2 seconds
- [ ] Presence indicators show active collaborators in the navbar
- [ ] Viewer-role users cannot mutate cameras or zones (403 from backend; controls hidden in UI)
- [ ] Save button and last-saved timestamp work correctly

---

## Milestone 4 — Coverage Analysis, Reports & Export
> **Goal:** Coverage analysis renders on the map. PDF report downloads. KML opens in Google Earth.

### M4.1 — Coverage Analysis (Backend)
- [ ] Extend `app/services/gis.py` — implement `compute_coverage_stats(fov_polygons, zone_polygons) → CoverageStats`
- [ ] Compute union of all FOV polygons (Shapely `unary_union`)
- [ ] Compute intersection of FOV union with `coverage_area` zones
- [ ] Identify uncovered sub-regions (zone area minus FOV union)
- [ ] Identify overlap zones (FOV polygons that intersect each other)
- [ ] Return `total_covered_m2`, `overlap_geojson`, `gap_geojson` as GeoJSON FeatureCollections
- [ ] Run Shapely operations via `asyncio.run_in_executor` (non-blocking)
- [ ] Create `app/routers/coverage.py` — `POST /api/v1/projects/{id}/coverage`
- [ ] Store result in `project.coverage_stats` on completion
- [ ] Broadcast `coverage_recalculated` via WebSocket to project room
- [ ] Register router in `app/main.py`
- [ ] Write unit tests for `compute_coverage_stats` with known fixture inputs

### M4.2 — Coverage Analysis (Frontend)
- [ ] Add "Recalculate Coverage" button to BottomToolbar or Layers tab
- [ ] Call `POST /projects/{id}/coverage` on click; show loading indicator
- [ ] Render `overlap_geojson` as a darker overlay layer on the map
- [ ] Render `gap_geojson` as a highlighted gap overlay layer on the map
- [ ] Display coverage stats panel — total covered area (m²), computed timestamp
- [ ] Handle `coverage_recalculated` WebSocket event — update overlays for other connected users

### M4.3 — Report Service (Backend)
- [ ] Create `app/services/report.py`
- [ ] Create Jinja2 HTML report template (`app/templates/report.html`) including:
  - Project name, description, date, author
  - Embedded base64 map image
  - Summary table (total cameras, total coverage m², zone count)
  - Per-camera table (label, model, position, bearing, FOV angle, range)
  - Zone/annotation list (label, type, area or length)
  - Footer noting 4-point FOV approximation caveat
- [ ] Implement `generate_pdf(project, cameras, zones, coverage_stats, map_image_base64) → bytes`
- [ ] Create `app/routers/export.py` — `POST /api/v1/projects/{id}/report`
- [ ] Accept `map_image_base64` and `include_coverage_stats` in request body
- [ ] Stream PDF bytes back as `application/pdf` with correct `Content-Disposition` header

### M4.4 — KML Export (Backend)
- [ ] Create `app/services/kml.py`
- [ ] Export camera positions as KML `Placemark` with `Point` geometry (name, model, bearing, range in description)
- [ ] Export FOV polygons as styled KML `Placemark` with `Polygon` geometry (semi-transparent fill)
- [ ] Export zones as KML `Placemark` with `Polygon` or `LineString` geometry
- [ ] Add `GET /api/v1/projects/{id}/export/kml` to `app/routers/export.py`
- [ ] Return `.kml` file as `application/vnd.google-earth.kml+xml`
- [ ] Register export router in `app/main.py`

### M4.5 — Report & Export (Frontend)
- [ ] Add "Generate Report" button to Navbar or export menu
- [ ] Capture map canvas as base64 PNG using `map.getCanvas().toDataURL()` (Leaflet)
- [ ] Call `POST /projects/{id}/report` with base64 image; trigger file download on response
- [ ] Show progress indicator during report generation
- [ ] Add "Export KML" button — call `GET /projects/{id}/export/kml`; trigger file download
- [ ] Handle errors gracefully (toast notification on failure)

### ✅ Milestone 4 Exit Criterion
- [ ] "Recalculate Coverage" renders gap and overlap overlays on the map
- [ ] Coverage stats (total m², timestamp) display correctly
- [ ] PDF report downloads with map screenshot, camera table, and coverage summary
- [ ] KML file opens in Google Earth with camera placemarks and FOV polygons visible
- [ ] Both report and KML export work for viewer-role users

---

## Milestone 5 — Polish & Hardening
> **Goal:** Application is production-ready, tested, and deployable to a fresh VM.

### M5.1 — Error Handling & Loading States
- [ ] Add loading spinners to all async operations (map load, FOV update, coverage analysis, report generation)
- [ ] Add error toast notifications for all API failures
- [ ] Implement WebSocket reconnect logic with exponential backoff
- [ ] Handle expired session gracefully — redirect to login with "session expired" message
- [ ] Add 404 and 500 error pages in React

### M5.2 — Input Validation
- [ ] Frontend: validate bearing input (0–360), FOV angle (1–360), range (> 0), required fields
- [ ] Frontend: validate email format on login and invite forms
- [ ] Backend: add Pydantic field constraints to all schemas (min/max values, string lengths)
- [ ] Backend: add rate limiting on auth endpoints using `slowapi` (e.g. 10 requests/minute on login)

### M5.3 — Testing
- [ ] Unit tests for GIS service (`compute_fov_polygon`, `compute_coverage_stats`) — `tests/test_gis.py`
- [ ] Unit tests for security utilities (`hash_password`, JWT functions) — `tests/test_security.py`
- [ ] Integration tests for auth flow (login, refresh, logout, invite) — `tests/test_auth.py`
- [ ] Integration tests for camera CRUD + FOV computation — `tests/test_cameras.py`
- [ ] Integration tests for coverage analysis endpoint — `tests/test_coverage.py`
- [ ] Run full test suite: `pytest packages/backend/tests/`
- [ ] All tests pass

### M5.4 — Performance
- [ ] Test project with 50 cameras — verify FOV compute < 100ms per camera
- [ ] Test coverage analysis with 50 cameras and 20 zones — verify response < 5 seconds
- [ ] Profile Shapely operations if slow; optimise with `run_in_executor` if blocking event loop

### M5.5 — Security Review
- [ ] Confirm CORS config in FastAPI allows only the frontend origin in production
- [ ] Confirm all input length limits are set (prevent oversized payloads)
- [ ] Confirm no sensitive data (passwords, tokens) appears in logs
- [ ] Confirm HTTPS is enforced in Nginx production config
- [ ] Confirm `JWT_SECRET` is a strong random value in production `.env`

### M5.6 — Responsive Layout
- [ ] Review layout on tablet viewport (768px minimum)
- [ ] Left panel collapses to icon bar on small screens
- [ ] Bottom toolbar scrolls horizontally on narrow screens
- [ ] Camera edit panel is scrollable on small viewports

### M5.7 — Production Docker Compose
- [ ] Write `docker-compose.yml` with four services: `nginx`, `backend`, `mongodb`, `redis`
- [ ] Write `nginx/nginx.conf` — serve `/dist`, proxy `/api/*`, upgrade `/ws/*`
- [ ] Write `packages/backend/Dockerfile` (Python 3.12 slim, WeasyPrint system deps)
- [ ] Write `packages/frontend/Dockerfile` (Node 18 build stage → Nginx serve stage)
- [ ] Set Docker restart policies (`unless-stopped`) on all services
- [ ] Mount MongoDB data volume (`./data/mongo`) and Redis volume (`./data/redis`)
- [ ] Test full production stack locally with `docker compose up`

### M5.8 — Documentation
- [ ] Write `README.md`:
  - Prerequisites (Node ≥18, pnpm, Python 3.12, UV, MongoDB, Redis)
  - Local dev setup (step by step)
  - Environment variable reference
  - First-admin seed instructions
  - Production deployment instructions (Docker Compose on VM)
  - Architecture overview (brief)

### ✅ Milestone 5 Exit Criterion
- [ ] All unit and integration tests pass
- [ ] Application handles errors gracefully throughout (no unhandled crashes)
- [ ] Production Docker Compose builds and runs on a clean machine
- [ ] README allows a new developer to set up the project from scratch without assistance
- [ ] 50-camera project performs within latency targets

---

## Summary

| Milestone | Description | Status |
|---|---|---|
| M1 | Foundation — Auth, Invite, DB connection | 🔄 In Progress |
| M2 | Core Map — Camera placement, FOV rendering | ⬜ Not Started |
| M3 | Zones, Collaboration, Save | ⬜ Not Started |
| M4 | Coverage Analysis, PDF Report, KML Export | ⬜ Not Started |
| M5 | Polish, Testing, Production Deployment | ⬜ Not Started |
