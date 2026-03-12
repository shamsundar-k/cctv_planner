# CCTV Survey Planner — Milestones & Tasks

**Project:** CCTV Survey Planner
**Version:** 1.1
**Last Updated:** March 2026
**Change:** Added Stage 1 geometric coverage (tilt-aware trapezoid, varifocal lens) and Stage 2 DORI analysis (IEC EN 62676-4:2015) tasks. All FOV + DORI calculations are client-side (`fov.ts`); backend stores client-supplied `fov_geojson` verbatim.
**Progress Updated:** 2026-03-08 — Milestone 1 complete; M2.1 (Camera Model CRUD) complete; M2.2 (Project CRUD) complete.

---

## How to Use This File

- Check off tasks as you complete them `[x]`
- Each milestone has an exit criterion — don't move to the next milestone until it passes
- Tasks are ordered by dependency — follow them top to bottom within each milestone

---

## Milestone 1 — Foundation
>
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

- [x] Create `app/core/config.py` — Pydantic settings model reading from `.env.local`
- [x] Create `app/core/database.py` — MongoDB connection via Beanie + Redis async client
- [x] Wire database startup/shutdown into `app/main.py` lifespan
- [x] Verify MongoDB Atlas connection on startup (log confirmation)
- [x] Verify Redis Cloud connection on startup (log confirmation)

### M1.5 — Beanie Document Models

- [x] Create `app/models/user.py` — `User` document
- [x] Create `app/models/invite_token.py` — `InviteToken` document
- [x] Create `app/models/camera_model.py` — `CameraModel` document (varifocal + sensor fields per SPEC §5.1)
- [x] Create `app/models/project.py` — `Project` document
- [x] Create `app/models/camera_instance.py` — `CameraInstance` document (Stage 1 + Stage 2 override fields + `fov_geojson` FeatureCollection + `ir_fov_geojson` FeatureCollection or null + `dori_zones_visible`)
- [x] Create `app/models/zone.py` — `Zone` document
- [x] Register all models in Beanie initialisation
- [ ] Write and run a seed script to insert one test document of each type
- [ ] Verify all documents appear in MongoDB Atlas dashboard

### M1.6 — Security Utilities

- [x] Create `app/core/security.py`
- [x] Implement `hash_password(plain: str) → str` using passlib bcrypt
- [x] Implement `verify_password(plain: str, hashed: str) → bool`
- [x] Implement `create_access_token(user_id: str, role: str) → str` (JWT, 15min TTL)
- [x] Implement `create_refresh_token() → str` (random 32-byte URL-safe string)
- [x] Implement `decode_access_token(token: str) → dict` (raises on invalid/expired)
- [x] Create `app/core/deps.py` — `get_current_user` FastAPI dependency
- [x] Create `app/core/deps.py` — `require_admin` dependency
- [x] Unit test all security functions in `tests/test_security.py`

### M1.7 — Auth Routes

- [x] Create `app/routers/auth.py`
- [x] Implement `POST /api/v1/auth/login`
- [x] Implement `POST /api/v1/auth/refresh`
- [x] Implement `POST /api/v1/auth/logout`
- [x] Store refresh token hash in Redis with 7-day TTL on login
- [x] Register auth router in `app/main.py`
- [x] Test all three routes manually (curl or Postman)

### M1.8 — Invite Flow

- [x] Create `app/routers/admin.py`
- [x] Implement `POST /api/v1/admin/invite`
- [x] Implement `GET /api/v1/admin/users`
- [x] Implement `GET /api/v1/auth/accept-invite?token=...`
- [x] Implement `POST /api/v1/auth/accept-invite`
- [x] Register admin router in `app/main.py`
- [x] Test full invite flow manually end-to-end

### M1.9 — First Admin Seed

- [x] Create `app/core/seed.py` — `seed_first_admin()` function
- [x] On FastAPI startup: check if any admin user exists; if not, create from env vars
- [x] Log a warning if default admin password is still `admin123`
- [x] Test: fresh database → startup → admin account exists

### M1.10 — Frontend Auth UI

- [x] Create `src/store/authSlice.ts`
- [x] Create `src/api/client.ts` — Axios instance
- [x] Create `src/api/interceptors.ts` — attach access token; on 401 call refresh and retry
- [x] Create `src/pages/LoginPage.tsx`
- [x] Create `src/components/ProtectedRoute.tsx`
- [x] Create `src/pages/AcceptInvitePage.tsx`
- [x] Set up React Router with `/login`, `/accept-invite`, `/` (protected) routes
- [x] Create placeholder `src/pages/DashboardPage.tsx`
- [x] Test full flow: login → dashboard; unauthenticated → redirect to login

### ✅ Milestone 1 Exit Criterion

- [x] Admin logs in successfully
- [x] Admin generates an invite link via `POST /admin/invite`
- [x] New user registers via invite link
- [x] New user logs in successfully
- [x] Axios interceptor silently refreshes expired access token
- [x] Viewer of `/` without auth is redirected to `/login`

---

## Milestone 2 — Core Map Features + FOV & DORI Engine
>
> **Goal:** User can place cameras with varifocal, tilt, and height parameters; see the trapezoidal FOV and colour-coded DORI zones render in real time with no API round-trip; adjust any parameter and see geometry update instantly.

### M2.1 — Camera Model CRUD (Backend)

- [x] Create `app/schemas/camera_model.py` — request/response Pydantic schemas including all varifocal + sensor fields (`focal_length_min/max`, `h_angle_max/min`, `v_angle_max/min`, `sensor_resolution_h`, `sensor_aspect_ratio`, `ir_range`)
- [x] Create `app/routers/camera_models.py`
- [x] Implement `GET /api/v1/camera-models`
- [x] Implement `POST /api/v1/camera-models`
- [x] Implement `GET /api/v1/camera-models/{id}`
- [x] Implement `PUT /api/v1/camera-models/{id}`
- [x] Implement `DELETE /api/v1/camera-models/{id}`
- [x] Register router in `app/main.py`
- [ ] Test the camera model CRUD

### M2.2 — Project CRUD (Backend)

- [x] Create `app/schemas/project.py`
- [x] Create `app/routers/projects.py`
- [x] Implement `GET /api/v1/projects`
- [x] Implement `POST /api/v1/projects`
- [x] Implement `GET /api/v1/projects/{id}` — returns full project with cameras (including `fov_geojson`) + zones
- [x] Implement `PUT /api/v1/projects/{id}`
- [x] Implement `DELETE /api/v1/projects/{id}`
- [x] Implement `POST /api/v1/projects/{id}/collaborators`
- [x] Implement `DELETE /api/v1/projects/{id}/collaborators/{user_id}`
- [x] Register router in `app/main.py`
- [ ] Test the project CRUD

### M2.3 — Camera Instance Routes (Backend)
>
> The backend does **not** compute FOV geometry. It receives `fov_geojson` from the client and stores it.

- [ ] Create `app/schemas/camera_instance.py` — request schema includes all Stage 1 + Stage 2 override fields plus `fov_geojson: dict` (GeoJSON FeatureCollection), `ir_fov_geojson: dict | None`, `dori_zones_visible: bool`
- [ ] Create `app/routers/cameras.py`
- [ ] Implement `POST /api/v1/projects/{id}/cameras` — validate `fov_geojson` is a valid GeoJSON FeatureCollection (schema check only); persist document
- [ ] Implement `PUT /api/v1/projects/{id}/cameras/{cam_id}` — same validation; update document
- [ ] Implement `DELETE /api/v1/projects/{id}/cameras/{cam_id}`
- [ ] Enforce owner/editor role on all mutating routes
- [ ] Register router in `app/main.py`

### M2.4 — Geodesic Projection Helper (Frontend)
>
> Foundation utility required by all FOV geometry code.

- [ ] Create `src/utils/geo.ts`
- [ ] Implement `projectPoint(lat: number, lng: number, bearingDeg: number, distanceM: number): { lat: number; lng: number }` — WGS84 spherical projection formula per SPEC §6.1 Step 1E
- [ ] Implement `toRad(deg: number): number` and `toDeg(rad: number): number` helpers
- [ ] Write unit tests: project north 1000m from (0,0) → expect lat ≈ 0.008993°, lng = 0; project east 1000m → expect lat = 0, lng ≈ 0.008993°

### M2.5 — Stage 1 Geometric FOV Engine (Frontend)

- [ ] Create `src/utils/fov.ts`
- [ ] Implement `interpolateAngles(params: VarifocalParams): { hAngle: number; vAngle: number }` — linear interpolation per SPEC §6.1 Step 1A; collapses correctly for fixed-lens cameras
- [ ] Implement `computeGroundDistances(H: number, tiltDeg: number, vAngleDeg: number): { dNear: number; dFar: number }` — tilt geometry per SPEC §6.1 Step 1B
- [ ] Implement tilt validity guard: if `tiltDeg <= vAngleDeg / 2` return `{ dNear, dFar: Infinity }` — caller must cap `dFar` at `maxRange`
- [ ] Implement `computeWidths(dNear: number, dFar: number, hAngleDeg: number): { wNear: number; wFar: number }`
- [ ] Implement `computeTrapezoidArea(wNear: number, wFar: number, dNear: number, dFar: number): number`
- [ ] Implement `buildTrapezoidGeoJSON(lat, lng, bearing, hAngleDeg, dNear, dFar): GeoJSON.Polygon` — uses `projectPoint` for all four corners; vertex order per SPEC §6.1 Step 1E
- [ ] Write unit tests validating Stage 1 against worked example (SPEC §6.1): H=4m, θ=30°, V=30°, H_angle=52°, f=6mm → D_near=4.0m, D_far=14.9m, W_near=3.9m, W_far=14.6m, Area=100.8m²

### M2.6 — Stage 2 DORI Engine (Frontend)

- [ ] In `src/utils/fov.ts`:
- [ ] Implement `computePPM(d: number, H: number, hAngleDeg: number, R_H: number): number` — slant-distance PPM formula per SPEC §6.2 Step 2A
- [ ] Implement `computeDORIDistance(ppmThreshold: number, H: number, hAngleDeg: number, R_H: number): number` — horizontal DORI boundary distance per SPEC §6.2 Step 2B
- [ ] Implement `clampDORIDistances(dNear, dFar, H, hAngleDeg, R_H): DORIDistances` — compute all four DORI thresholds (250/125/62/25 PPM) and clamp each to `dFar`; set `null` geometry flag if beyond `dFar`
- [ ] Implement `buildDORIFeature(lat, lng, bearing, hAngleDeg, dInner, dOuter, zone, ppmThreshold, ppmAtInner, ppmAtOuter): GeoJSON.Feature` — trapezoid sub-zone or null-geometry feature
- [ ] Write unit tests validating Stage 2 against worked example (SPEC §6.2): R_H=2560, H=4m, H_angle=52° → D_identification=9.7m, D_recognition=14.9m, D_observation=clamped to 14.9m (beyond D_far), identification_area=38.2m², recognition_area=62.6m²

### M2.7 — Master FOV Feature Collection Builder (Frontend)

- [ ] Implement `resolveModelParams(instance: CameraInstance, model: CameraModel): ResolvedCameraModel` — merges overrides onto model defaults
- [ ] Implement `computeFOVFeatureCollection(instance: CameraInstance, model: CameraModel): { fov_geojson: GeoJSON.FeatureCollection; ir_fov_geojson: GeoJSON.FeatureCollection | null }` — computes both daytime and IR-truncated FeatureCollections in one pass; `ir_fov_geojson` is null if `model.ir_range` is null; applies `maxRange` cap to `dFar` for daytime; additionally caps `dFar` at IR depth for `ir_fov_geojson`
- [ ] Ensure function is pure (no side effects) and returns within 5ms for any valid input
- [ ] Export all public types: `VarifocalParams`, `ResolvedCameraModel`, `DORIDistances`, `TrapezoidResult`

### M2.8 — Project Dashboard (Frontend)

- [ ] Create `src/api/projects.ts` — React Query hooks (`useProjects`, `useProject`, `useCreateProject`)
- [ ] Create `src/pages/DashboardPage.tsx` — project list, create button
- [ ] Create `src/components/CreateProjectModal.tsx`
- [ ] Route `/projects/:id` → `ProjectPage` (scaffold)

### M2.9 — Map Canvas (Frontend)

- [ ] Install and configure Leaflet.js in `src/pages/ProjectPage.tsx`
- [ ] Render Stadia Maps tile layer using `VITE_STADIA_MAPS_API_KEY`
- [ ] Create `src/store/mapSlice.ts` — active tool, layer visibility toggles including `showDORIZones: boolean`, `irMode: boolean` (global IR mode — switches all cameras between `fov_geojson` and `ir_fov_geojson`)
- [ ] Create `src/components/map/MapCanvas.tsx`
- [ ] Create `src/components/layout/Navbar.tsx`
- [ ] Create `src/components/layout/LeftPanel.tsx` — tabbed panel scaffold
- [ ] Create `src/components/layout/BottomToolbar.tsx`

### M2.10 — Camera Placement, Rendering & Editing (Frontend)

- [ ] Create `src/store/cameraSlice.ts` — cameras array (with all new fields), selected camera ID
- [ ] Create `src/api/cameras.ts` — React Query hooks (`usePlaceCamera`, `useUpdateCamera`, `useDeleteCamera`)
- [ ] Implement "Place Camera" tool — map click → model selector popup → call `computeFOVFeatureCollection` → render immediately → `POST /cameras` with both `fov_geojson` and `ir_fov_geojson`
- [ ] Render outer FOV trapezoid as GeoJSON layer (semi-transparent fill, per-camera colour, stroke)
- [ ] Render DORI sub-zone features as GeoJSON layers (DORI colour palette) when `dori_zones_visible` is true
- [ ] **Implement IR mode rendering — when `mapSlice.irMode` is true, render each camera's `ir_fov_geojson` instead of `fov_geojson` (swap Leaflet GeoJSON layer source); cameras with null `ir_fov_geojson` are unaffected and continue rendering `fov_geojson`; no recalculation occurs on toggle**
- [ ] Render camera icon as directional SVG marker (rotated to bearing)
- [ ] Implement drag-to-move — `dragend` → recompute both `fov_geojson` and `ir_fov_geojson` client-side → re-render active mode immediately → 300ms debounce → `PUT /cameras/{id}`
- [ ] Implement bearing rotation handle on FOV arc → recompute → re-render → debounced PUT
- [ ] Create `src/components/camera/CameraEditPanel.tsx`:
  - Camera label (editable)
  - Camera model selector (dropdown)
  - Bearing (numeric input + compass dial)
  - **Mounting height (m) input**
  - **Tilt angle (°) input with guard indicator if `θ ≤ V_angle/2`**
  - **Focal length slider — range [model.focal_length_min, model.focal_length_max]; live readout of interpolated H_angle and V_angle**
  - Override H-angle and V-angle (advanced, optional)
  - Override max range (m) input
  - Override sensor resolution (px) input
  - Colour picker
  - FOV visibility toggle
  - DORI zones visibility toggle
  - Delete button
- [ ] Create `src/components/camera/DORIInfoPanel.tsx` — read-only panel showing for selected camera:
  - Identification distance (m) and zone area (m²)
  - Recognition distance (m) and zone area (m²)
  - Observation distance (m, or "Full footprint" if beyond D_far)
  - Detection distance (m, or "Full footprint" if beyond D_far)
  - Total FOV area (m²), D_near (m), D_far (m)
  - PPM at near edge and far edge
  - Values sourced from `fov_geojson` feature properties — no recomputation
- [ ] Implement per-camera FOV + DORI visibility toggles
- [ ] Implement global FOV show/hide toggle (Layers tab)
- [ ] Implement global DORI zones show/hide toggle (Layers tab)
- [ ] Implement global IR mode toggle in Layers tab — switches all cameras between daytime (`fov_geojson`) and IR (`ir_fov_geojson`) rendering; `DORIInfoPanel` also switches data source to show nighttime distances when IR mode is active
- [ ] Populate Cameras tab in left panel

### ✅ Milestone 2 Exit Criterion

- [ ] User can create a project and open it
- [ ] User can place a camera with varifocal model (focal length range, H/V angles, sensor resolution), mounting height, and tilt angle
- [ ] Trapezoidal FOV and four DORI sub-zone bands render on the map immediately on placement — no additional API call made
- [ ] Adjusting bearing, focal length slider, tilt, height, or resolution causes geometry to update on the map within 500ms — no API call during adjustment
- [ ] `DORIInfoPanel` shows correct Identification (9.7m), Recognition (14.9m), Observation (full footprint), Detection (full footprint) for the PDF worked example inputs (H=4m, θ=30°, f=6mm, 2560px sensor)
- [ ] Debounced PUT fires after user stops editing, persisting the updated `fov_geojson` to the backend
- [ ] Per-camera and global FOV/DORI visibility toggles work
- [ ] Global IR mode toggle switches all cameras between daytime and IR-truncated trapezoids instantly with no recalculation
- [ ] Editor/viewer role permissions enforced on camera routes

---

## Milestone 3 — Zones, Collaboration & Save
>
> **Goal:** Zone drawing works. Two users editing the same project see each other's changes in real time, including updated FOV trapezoids and DORI zones.

### M3.1 — Zone Routes (Backend)

- [ ] Create `app/schemas/zone.py`
- [ ] Create `app/routers/zones.py`
- [ ] Implement `POST /api/v1/projects/{id}/zones`
- [ ] Implement `PUT /api/v1/projects/{id}/zones/{zone_id}`
- [ ] Implement `DELETE /api/v1/projects/{id}/zones/{zone_id}`
- [ ] Enforce owner/editor role on all mutating routes
- [ ] Register router in `app/main.py`

### M3.2 — WebSocket Manager (Backend)

- [ ] Create `app/services/websocket_manager.py` — room registry keyed by `project_id`
- [ ] Implement `connect`, `disconnect`, `broadcast`
- [ ] Store presence set in Redis
- [ ] Create `app/routers/websocket.py` — `WS /ws/projects/{id}?token=...`
- [ ] Validate JWT on upgrade; reject with close code 4001 if invalid
- [ ] Broadcast `user_joined` on connect, `user_left` on disconnect
- [ ] Wire camera and zone route handlers to broadcast after successful DB write — include full `fov_geojson` FeatureCollection in `camera_updated` / `camera_added` payloads so remote clients re-render DORI zones without recomputing
- [ ] Register WebSocket router in `app/main.py`

### M3.3 — Zone Drawing (Frontend)

- [ ] Install Leaflet.draw
- [ ] Create `src/store/zoneSlice.ts`
- [ ] Create `src/api/zones.ts`
- [ ] Implement polygon drawing tool → `POST /zones` on completion
- [ ] Implement polyline drawing tool → `POST /zones` on completion
- [ ] Render zones as GeoJSON layers (distinct z-order from FOV/DORI layers)
- [ ] Create `src/components/zone/ZoneEditPanel.tsx`
- [ ] Populate Zones tab in left panel

### M3.4 — Real-Time Collaboration (Frontend)

- [ ] Create `src/hooks/useProjectWebSocket.ts` — connect on project open, reconnect with backoff
- [ ] Handle `camera_updated` — merge updated camera (including new `fov_geojson`) into Zustand store; re-render FOV trapezoid + DORI sub-zones on map
- [ ] Handle `camera_added`, `camera_deleted` — update store and map
- [ ] Handle `zone_updated`, `zone_added`, `zone_deleted`
- [ ] Handle `user_joined`, `user_left`
- [ ] Create `src/components/layout/PresenceIndicators.tsx`

### M3.5 — Save & Auto-Save (Frontend)

- [ ] Auto-save on camera/zone mutation (changes persisted via REST; `project.updated_at` updated)
- [ ] Manual Save button in Navbar
- [ ] Last-saved timestamp in Navbar
- [ ] Unsaved changes indicator

### M3.6 — Collaborator Management (Frontend)

- [ ] Create `src/components/project/CollaboratorsModal.tsx`
- [ ] Connect to collaborator add/remove endpoints

### ✅ Milestone 3 Exit Criterion

- [ ] User can draw polygons and polylines on the map
- [ ] Two editors in the same project see each other's camera changes (including updated DORI zones) within 2 seconds
- [ ] Presence indicators show active collaborators
- [ ] Viewer-role users cannot mutate cameras or zones
- [ ] Save button and last-saved timestamp work correctly

---

## Milestone 4 — Coverage Analysis, Reports & Export
>
> **Goal:** Coverage analysis renders on the map. PDF report includes DORI table per camera. KML opens in Google Earth with colour-coded DORI zones.

### M4.1 — Coverage Analysis (Backend)

- [ ] Extend `app/services/gis.py` — implement `compute_coverage_stats(fov_polygons, zone_polygons) → CoverageStats`
- [ ] Extract `feature[0]` (outer FOV trapezoid) from each camera's `fov_geojson` FeatureCollection — this is the geometry used for union/gap analysis; DORI sub-zones are excluded
- [ ] Compute union of outer FOV polygons (Shapely `unary_union`)
- [ ] Compute intersection with `coverage_area` zones
- [ ] Identify uncovered sub-regions and overlap zones
- [ ] Run Shapely operations via `asyncio.run_in_executor`
- [ ] Create `app/routers/coverage.py` — `POST /api/v1/projects/{id}/coverage`
- [ ] Store result in `project.coverage_stats`
- [ ] Broadcast `coverage_recalculated` via WebSocket
- [ ] Register router in `app/main.py`
- [ ] Write unit tests with known fixture inputs

### M4.2 — Coverage Analysis (Frontend)

- [ ] Add "Recalculate Coverage" button to BottomToolbar or Layers tab
- [ ] Call `POST /projects/{id}/coverage`; show loading indicator
- [ ] Render `overlap_geojson` overlay layer
- [ ] Render `gap_geojson` overlay layer
- [ ] Display coverage stats panel (total m², timestamp)
- [ ] Handle `coverage_recalculated` WebSocket event

### M4.3 — Report Service (Backend)

- [ ] Create `app/services/report.py`
- [ ] Update Jinja2 HTML report template (`app/templates/report.html`):
  - Project name, description, date, author
  - Embedded base64 map image
  - Summary table: total cameras, total coverage area (m²), zone count
  - Per-camera table: label, model, position, bearing, chosen focal length (mm), H-angle (°), V-angle (°), mounting height (m), tilt angle (°), D_near (m), D_far (m), total FOV area (m²)
  - **Per-camera DORI table: Identification distance (m) + area (m²), Recognition distance (m) + area (m²), Observation distance / "Full footprint", Detection distance / "Full footprint"** — all values extracted from `fov_geojson` feature properties
  - Zone/annotation list
  - Footer: *"DORI distances per IEC EN 62676-4:2015 using slant-distance PPM formula. Results are design-guide estimates."* + trapezoidal FOV approximation caveat
- [ ] Implement `generate_pdf(project, cameras, zones, coverage_stats, map_image_base64) → bytes`
- [ ] Accept `include_dori_table: bool` in request body
- [ ] Create/update `app/routers/export.py` — `POST /api/v1/projects/{id}/report`
- [ ] Stream PDF bytes as `application/pdf`

### M4.4 — KML Export (Backend)

- [ ] Create `app/services/kml.py`
- [ ] For each camera, create a KML `<Folder>` named after the camera label containing:
  - Camera position as `<Placemark>` with `<Point>` (name, model, bearing, chosen focal length, mounting height, tilt)
  - Outer FOV trapezoid as `<Placemark>` with `<Polygon>` (per-camera colour, semi-transparent fill)
  - **Identification zone as `<Placemark>` with `<Polygon>` (deep blue `#1a237e`, 55% opacity) — if geometry is non-null**
  - **Recognition zone as `<Placemark>` with `<Polygon>` (green `#388e3c`, 45% opacity) — if geometry is non-null**
  - **Observation zone as `<Placemark>` with `<Polygon>` (amber `#f57c00`, 40% opacity) — if geometry is non-null**
  - **Detection zone as `<Placemark>` with `<Polygon>` (red `#c62828`, 30% opacity) — if geometry is non-null**
- [ ] Export drawn zones as `<Placemark>` with `<Polygon>` or `<LineString>`
- [ ] Add `GET /api/v1/projects/{id}/export/kml` to `app/routers/export.py`
- [ ] Return `.kml` as `application/vnd.google-earth.kml+xml`
- [ ] Register export router in `app/main.py`

### M4.5 — Report & Export (Frontend)

- [ ] Add "Generate Report" button
- [ ] Capture map canvas as base64 PNG
- [ ] Call `POST /projects/{id}/report` with `include_dori_table: true`; trigger file download
- [ ] Show progress indicator
- [ ] Add "Export KML" button → `GET /projects/{id}/export/kml` → download
- [ ] Handle errors with toast notifications

### ✅ Milestone 4 Exit Criterion

- [ ] "Recalculate Coverage" renders gap and overlap overlays (using outer FOV trapezoids)
- [ ] Coverage stats display correctly
- [ ] PDF report downloads with map screenshot, per-camera table, **DORI distances and zone areas per camera**, and coverage summary
- [ ] KML file opens in Google Earth with camera placemarks, outer FOV trapezoids, and **colour-coded DORI sub-zone polygons per camera**
- [ ] Both report and KML export work for viewer-role users

---

## Milestone 5 — Polish & Hardening
>
> **Goal:** Application is production-ready, tested, and deployable to a fresh VM.

### M5.1 — Error Handling & Loading States

- [ ] Loading spinners on all async operations
- [ ] Error toast notifications for all API failures
- [ ] WebSocket reconnect with exponential backoff
- [ ] Expired session redirect to login with "session expired" message
- [ ] 404 and 500 error pages in React

### M5.2 — Input Validation

- [ ] **Frontend: tilt angle guard — display "Camera sees sky" warning when `tilt ≤ v_angle / 2`; disable save until resolved or max_fov_render_distance override is set**
- [ ] **Frontend: focal length within `[model.focal_length_min, model.focal_length_max]`**
- [ ] **Frontend: mounting height > 0 m**
- [ ] Frontend: bearing 0–360, required fields
- [ ] Frontend: email format on login/invite forms
- [ ] Backend: Pydantic field constraints on all schemas (tilt 0–89°, focal length > 0, sensor_resolution_h > 0, etc.)
- [ ] Backend: rate limiting on auth endpoints (`slowapi`, 10 req/min on login)

### M5.3 — Testing

- [ ] **`src/utils/fov.test.ts` — Stage 1 unit tests:**
  - `interpolateAngles`: verify H_angle=52° and V_angle=30° for worked example (f=6mm, f_min=2.8mm, f_max=12mm, h_angle_max=97°/v_angle_max=54°, h_angle_min=28°/v_angle_min=16°) — note worked example uses datasheet-corrected 52°/30°
  - `computeGroundDistances`: D_near=4.0m, D_far=14.9m for H=4m, θ=30°, V=30°
  - `computeWidths`: W_near=3.9m, W_far=14.6m
  - `computeTrapezoidArea`: Area=100.8m²
  - Tilt guard: returns `dFar=Infinity` when θ=15°, V_angle=30°
- [ ] **`src/utils/fov.test.ts` — Stage 2 unit tests:**
  - `computePPM`: PPM at D_near (4.0m) ≈ 329 PPM; at D_far (14.9m) ≈ 88 PPM
  - `computeDORIDistance`: D_identification=9.7m, D_recognition=14.9m, D_observation>D_far, D_detection>D_far
  - Zone areas: identification_area=38.2m², recognition_area=62.6m²
  - Full FeatureCollection: 5 features; features[3] and [4] have null geometry (observation + detection beyond D_far)
- [ ] Backend: unit tests for GIS Service `compute_coverage_stats` — `tests/test_gis.py`
- [ ] Backend: unit tests for security utilities — `tests/test_security.py`
- [ ] Backend: integration tests for auth flow — `tests/test_auth.py`
- [ ] Backend: integration tests for camera CRUD (POST camera with `fov_geojson`; verify stored verbatim; verify WebSocket broadcast includes `fov_geojson`) — `tests/test_cameras.py`
- [ ] Backend: integration tests for coverage endpoint — `tests/test_coverage.py`
- [ ] Run full test suite: `pytest packages/backend/tests/` and `pnpm test` (frontend)
- [ ] All tests pass

### M5.4 — Performance

- [ ] **Browser performance: run `computeFOVFeatureCollection` 50 times in a loop (computing both `fov_geojson` and `ir_fov_geojson` per call); verify total time < 250ms (5ms per camera budget)**
- [ ] Test project with 50 cameras — verify map renders all FOV trapezoids + DORI zones without frame drops
- [ ] Test coverage analysis with 50 cameras and 20 zones — verify backend response < 5 seconds
- [ ] Profile Shapely operations if slow

### M5.5 — Security Review

- [ ] Confirm CORS config allows only the frontend origin in production
- [ ] Confirm input length limits are set
- [ ] Confirm no sensitive data in logs
- [ ] Confirm HTTPS enforced in Nginx production config
- [ ] Confirm `JWT_SECRET` is a strong random value in production `.env`

### M5.6 — Responsive Layout

- [ ] Review layout on tablet viewport (768px minimum)
- [ ] Left panel collapses to icon bar on small screens
- [ ] Bottom toolbar scrolls horizontally on narrow screens
- [ ] Camera edit panel + DORIInfoPanel scrollable on small viewports

### M5.7 — Production Docker Compose

- [ ] Write `docker-compose.yml` with four services: `nginx`, `backend`, `mongodb`, `redis`
- [ ] Write `nginx/nginx.conf` — serve `/dist`, proxy `/api/*`, upgrade `/ws/*`
- [ ] Write `packages/backend/Dockerfile` (Python 3.12 slim — Debian/Ubuntu base for WeasyPrint system deps)
- [ ] Write `packages/frontend/Dockerfile` (Node 18 build stage → Nginx serve stage)
- [ ] Set Docker restart policies (`unless-stopped`) on all services
- [ ] Mount MongoDB and Redis data volumes
- [ ] Test full production stack locally with `docker compose up`

### M5.8 — Documentation

- [ ] Write `README.md`:
  - Prerequisites (Node ≥18, pnpm, Python 3.12, UV, MongoDB, Redis)
  - Local dev setup
  - Environment variable reference
  - First-admin seed instructions
  - Production deployment (Docker Compose on VM)
  - Architecture overview
  - **FOV + DORI calculation notes: how Stage 1 and Stage 2 work, where `fov.ts` lives, how to run unit tests**

### ✅ Milestone 5 Exit Criterion

- [ ] All unit tests pass including all Stage 1 and Stage 2 fixture checks from the DORI PDF worked example
- [ ] Application handles errors gracefully throughout
- [ ] Tilt guard displays clearly in the UI and prevents nonsensical geometry
- [ ] Production Docker Compose builds and runs on a clean machine
- [ ] README allows a new developer to set up from scratch without assistance
- [ ] 50-camera project performs within latency targets (FOV+DORI render, coverage analysis)

---

## Summary

| Milestone | Description | Status |
|---|---|---|
| M1 | Foundation — Auth, Invite, DB connection | ✅ Complete |
| M2 | Core Map — Camera placement, Stage 1 trapezoid FOV, Stage 2 DORI zones (all client-side) | 🔄 In Progress (M2.1–M2.2 done) |
| M3 | Zones, Collaboration, Save | ⬜ Not Started |
| M4 | Coverage Analysis, PDF Report (with DORI table), KML Export (with DORI zones) | ⬜ Not Started |
| M5 | Polish, Testing (Stage 1+2 unit tests), Production Deployment | ⬜ Not Started |
