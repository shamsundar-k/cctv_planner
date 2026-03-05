# CCTV Survey Planner — Project Planning Document

**Version:** 1.0  
**Date:** March 2026  
**Status:** Pre-Development Planning

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Scope and Constraints](#2-scope-and-constraints)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Data Models](#5-data-models)
6. [Feature Breakdown](#6-feature-breakdown)
7. [API Design](#7-api-design)
8. [GIS and FOV Logic](#8-gis-and-fov-logic)
9. [Frontend UI Design](#9-frontend-ui-design)
10. [Multi-User Considerations](#10-multi-user-considerations)
11. [Report and Export](#11-report-and-export)
12. [Development Phases](#12-development-phases)
13. [Open Questions and Risks](#13-open-questions-and-risks)

---

## 1. Project Overview

The CCTV Survey Planner is a web-based, multi-user GIS application that allows security consultants, surveyors, and facility managers to plan and validate CCTV camera deployments on a 2D map. Users can place cameras, configure their field-of-view (FOV) parameters, define monitored zones using polygons and lines, and generate coverage reports.

The core value proposition is visual confirmation of total coverage — enabling planners to identify blind spots, overlap zones, and perimeter gaps before physical installation.

---

## 2. Scope and Constraints

### In Scope

- 2D map-based camera placement and FOV visualisation
- Camera model definition (FOV angle, range, rotation)
- Project-level multi-user collaboration
- Zone/perimeter drawing tools (polygons, lines)
- Project save, load, and management
- PDF/printable report generation
- KML export for use in Google Earth / other GIS tools

### Out of Scope (Current Version)

- **3D / height-aware calculations** — Elevation, mounting height, and vertical tilt are explicitly excluded. All coverage is calculated as a flat 2D projection.
- Video feed integration or live camera connectivity
- AI-based camera placement optimisation
- Mobile-native app (responsive web only)
- Offline / PWA mode

---

## 3. System Architecture

The application follows a classic three-tier architecture with a clear separation of concerns.

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  (Map UI · Drawing Tools · FOV Overlay · Forms) │
└──────────────────────┬──────────────────────────┘
                       │ REST / WebSocket
┌──────────────────────▼──────────────────────────┐
│               Python / Node Backend              │
│       (Auth · Project API · GIS Logic)           │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              NoSQL Database (MongoDB)            │
│       (Users · Projects · Cameras · Zones)       │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Stateless REST API** for project CRUD operations.
- **WebSocket or Server-Sent Events (SSE)** for real-time multi-user collaboration within a project (live cursor/camera position updates).
- **GIS geometry computations** (FOV polygon generation, area intersection) performed server-side to keep client logic lightweight and results consistent.
- **Base map tiles** served from OpenStreetMap (Tile CDN) — no self-hosting required.

---

## 4. Technology Stack

### Frontend

| Concern | Technology | Rationale |
|---|---|---|
| UI Framework | React (Vite) | Component model suits map overlays and toolbars |
| Map Library | Leaflet.js or MapLibre GL JS | Both support OSM; MapLibre for vector tiles |
| Drawing Tools | Leaflet.draw / MapLibre Draw | Polygon and line annotation support |
| State Management | Zustand or Redux Toolkit | Project state, camera layers, UI toggles |
| Styling | Tailwind CSS | Utility-first, rapid iteration |
| API Client | Axios + React Query | Cache, refetch, optimistic updates |

### Backend

| Concern | Technology | Rationale |
|---|---|---|
| Runtime | Python (FastAPI) | Async, fast, excellent GIS library support |
| GIS / Geometry | Shapely + GeoJSON | FOV polygon generation, intersection queries |
| Authentication | JWT (via python-jose) | Stateless, easy multi-user session management |
| WebSockets | FastAPI WebSocket | Real-time project collaboration |
| Report Generation | WeasyPrint or ReportLab | HTML/CSS to PDF pipeline |
| KML Export | simplekml | Pythonic KML generation |

> **Alternative backend:** Node.js (Express / Fastify) with Turf.js for GIS operations is a viable alternative if the team prefers a JavaScript-only stack.

### Database

| Concern | Technology | Rationale |
|---|---|---|
| Primary Store | MongoDB (Atlas or self-hosted) | Document model fits flexible camera/zone schemas |
| ODM | Beanie (async Pydantic ODM for MongoDB) | Native FastAPI integration |
| Sessions / Cache | Redis | WebSocket presence, session tokens |

### Infrastructure

- **Containerisation:** Docker + Docker Compose for local development
- **Base Map Tiles:** OpenStreetMap via `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Deployment Target:** Cloud VM (e.g., AWS EC2, DigitalOcean Droplet) or container platform (Railway, Render)

---

## 5. Data Models

### User

```
User {
  _id: ObjectId
  email: string (unique)
  password_hash: string
  display_name: string
  created_at: datetime
  role: enum [admin, editor, viewer]
}
```

### Camera Model (Template / Library Entry)

A reusable definition that can be instantiated multiple times on a map.

```
CameraModel {
  _id: ObjectId
  owner_id: ObjectId (User)
  name: string               -- e.g. "Hikvision DS-2CD2143"
  manufacturer: string
  fov_angle: float           -- horizontal field of view in degrees (e.g. 90.0)
  max_range: float           -- effective detection range in metres
  min_range: float           -- near-field blind spot radius in metres
  aspect_ratio: float        -- optional, for display purposes
  notes: string
  created_at: datetime
}
```

### Project

```
Project {
  _id: ObjectId
  name: string
  description: string
  owner_id: ObjectId (User)
  collaborators: [
    { user_id: ObjectId, role: enum [editor, viewer] }
  ]
  base_map: {
    center_lat: float
    center_lng: float
    default_zoom: int
  }
  created_at: datetime
  updated_at: datetime
}
```

### Camera Instance (Placed on Map)

```
CameraInstance {
  _id: ObjectId
  project_id: ObjectId
  model_id: ObjectId (CameraModel)  -- reference to template
  label: string                      -- user-defined label, e.g. "CAM-01"
  position: {
    lat: float
    lng: float
  }
  bearing: float                     -- direction camera faces, degrees from North (0–360)
  is_fov_visible: boolean            -- display toggle
  override_fov_angle: float | null   -- if null, use model default
  override_range: float | null
  color: string                      -- hex colour for this camera's FOV zone
  created_at: datetime
}
```

### Zone / Annotation

```
Zone {
  _id: ObjectId
  project_id: ObjectId
  label: string
  type: enum [polygon, polyline]
  geojson: GeoJSON Geometry          -- Polygon or LineString
  purpose: enum [coverage_area, perimeter, exclusion, note]
  color: string
  created_at: datetime
}
```

---

## 6. Feature Breakdown

### 6.1 User Authentication and Multi-User Access

- Register, login, logout with JWT-based auth.
- Project owner can invite collaborators by email.
- Role-based permissions: **Owner** (full control), **Editor** (edit cameras/zones), **Viewer** (read-only, can export).
- Active session presence shown in the UI (e.g., avatar indicators on the map).

### 6.2 Camera Model Management

- CRUD interface for camera model library (per-user or shared global library TBD).
- Fields: name, manufacturer, FOV angle (degrees), max range (metres), min range (metres, near-field blind spot), notes.
- Camera models are templates; instances placed on the map can override individual parameters.

### 6.3 Project Management

- Create, rename, archive, delete projects.
- Project dashboard listing all user projects with last-edited timestamps.
- Clone project (duplicate with all cameras and zones).
- Project-level undo/redo history (stretch goal).

### 6.4 Map Drawing Tools

- **Polygon Tool:** Draw closed area polygons to mark coverage zones, restricted areas, or perimeters. Editable vertices after creation.
- **Polyline Tool:** Draw lines to mark perimeter fences, walls, or corridors.
- Each annotation is labelled, colour-coded, and can be toggled visible/hidden.
- Snap-to-grid or snap-to-vertex option for accurate placement.

### 6.5 Camera Placement and Editing

- **Place:** Click on the map to drop a camera. A popup prompts selection of camera model and label.
- **Move:** Drag-and-drop camera icon to reposition. FOV zone updates live.
- **Rotate:** Rotate bearing via a rotation handle on the FOV arc, or via a numeric input field.
- **Edit parameters:** Click camera to open a side panel — adjust bearing, override FOV angle, range, colour, visibility.
- **Delete:** Remove camera instance from the project.
- Camera icons are directional (arrow or sector icon pointing in bearing direction).

### 6.6 FOV Visualisation

- FOV rendered as a filled arc/sector polygon on the map layer.
- Near-field blind spot rendered as a cut-out circle at the camera origin.
- FOV zones are semi-transparent and colour-coded per camera.
- **Show/Hide individual FOV** via toggle on camera panel.
- **Show/Hide all FOVs** via global map control toggle.
- Coverage overlap areas are visually highlighted (darker shade where FOVs intersect).
- Uncovered areas within defined polygons can be calculated and highlighted (stretch goal).

### 6.7 Project Save

- **Auto-save:** Changes are pushed to the backend every N seconds (debounced) or on each user action.
- **Manual save:** Explicit "Save" button for user confidence.
- Version history: last 10 snapshots retained (stretch goal).

### 6.8 Report Generation

Report generated server-side as a PDF document. Content includes:

- Project name, description, date, author
- Map screenshot / static tile export showing all cameras and FOV zones
- Summary table: total cameras placed, total coverage area (m²), annotated zones
- Per-camera table: label, model, position (lat/lng), bearing, FOV angle, range
- Zone/annotation list: label, type, area or length
- Coverage gap analysis (if implemented)

### 6.9 KML Export

- Export all camera positions, FOV polygons, and drawn zones as a `.kml` file.
- Camera positions as KML Placemarks with name, description, and bearing.
- FOV zones and drawn polygons as KML Polygons with styling.
- Compatible with Google Earth, QGIS, and ArcGIS.

---

## 7. API Design

All endpoints prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Return JWT access + refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |

### Camera Models

| Method | Endpoint | Description |
|---|---|---|
| GET | `/camera-models` | List all camera models for user |
| POST | `/camera-models` | Create camera model |
| GET | `/camera-models/{id}` | Get single model |
| PUT | `/camera-models/{id}` | Update model |
| DELETE | `/camera-models/{id}` | Delete model |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | List user's projects |
| POST | `/projects` | Create project |
| GET | `/projects/{id}` | Get full project (cameras + zones) |
| PUT | `/projects/{id}` | Update project metadata |
| DELETE | `/projects/{id}` | Delete project |
| POST | `/projects/{id}/collaborators` | Invite collaborator |

### Cameras (within a project)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects/{id}/cameras` | List cameras in project |
| POST | `/projects/{id}/cameras` | Place camera |
| PUT | `/projects/{id}/cameras/{cam_id}` | Update camera (position, bearing, etc.) |
| DELETE | `/projects/{id}/cameras/{cam_id}` | Remove camera |

### Zones

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects/{id}/zones` | List zones |
| POST | `/projects/{id}/zones` | Create zone |
| PUT | `/projects/{id}/zones/{zone_id}` | Update zone |
| DELETE | `/projects/{id}/zones/{zone_id}` | Delete zone |

### Export and Reports

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects/{id}/report` | Accept base64 map image, generate and return PDF report |
| GET | `/projects/{id}/export/kml` | Generate and return KML file |

### WebSocket (Collaboration)

| Endpoint | Description |
|---|---|
| `WS /ws/projects/{id}` | Real-time collaboration channel for a project |

Message types: `camera_moved`, `camera_added`, `camera_deleted`, `zone_updated`, `user_joined`, `user_left`

---

## 8. GIS and FOV Logic

### 8.1 FOV Polygon Generation

The FOV for each camera is approximated as a **4-point polygon** — a simple, fixed-point shape that balances computational simplicity with reasonable arc coverage accuracy across all FOV angles.

The four points are:

1. **Origin:** The camera position `(lat, lng)`.
2. **Left vertex:** The point at `max_range` metres from the camera, at bearing `bearing - fov_angle/2`.
3. **Arc midpoint:** The point at `max_range` metres from the camera, at the centre bearing (i.e. the camera's primary facing direction). This vertex captures the outward bulge of the arc, preventing understatement of coverage at wide FOV angles.
4. **Right vertex:** The point at `max_range` metres from the camera, at bearing `bearing + fov_angle/2`.

These four points form a closed GeoJSON Polygon. No arc sweeping or iterative geometry is required — all four points are computed with a single geodesic projection each.

**Near-field blind spot (optional):** If `min_range > 0`, the origin point is replaced by two points — one at `min_range` along each bounding bearing — forming a 5-point truncated polygon (trapezoid with arc midpoint). The midpoint at `min_range` along the centre bearing may optionally be added for symmetry, giving a 6-point shape, though this is rarely necessary for practical survey purposes.

All distance/bearing calculations use **geodesic** methods (e.g. `geopy.distance` or `pyproj`) to remain accurate across different map locations.

### 8.2 Coordinate System

- All coordinates stored and transmitted as **WGS84 (EPSG:4326)** latitude/longitude.
- Display units presented in metres for range values.
- The backend converts degrees to metres using local geodesic approximations.

### 8.3 Coverage Intersection Analysis

- Union of all FOV polygons computed using `Shapely` to determine total covered area.
- Intersection of FOV union with drawn coverage-area polygons used to identify uncovered sub-regions.
- Results returned as GeoJSON FeatureCollections for rendering.

### 8.4 Map Rendering

- OpenStreetMap tiles via Leaflet.js or MapLibre GL.
- FOV sectors rendered as GeoJSON layers with fill colour, opacity, and stroke.
- Camera icons rendered as custom Leaflet DivIcons or SVG markers with bearing rotation applied via CSS transform.
- Drawn zones rendered as separate GeoJSON layers (distinct z-ordering from FOV layers).

---

## 9. Frontend UI Design

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Navbar: Logo | Project Name | Save | Collaborators | User   │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                  │
│  Left      │                 MAP CANVAS                      │
│  Panel     │                                                  │
│            │     [Camera Icons + FOV Zones + Zone Polygons]  │
│ - Cameras  │                                                  │
│ - Zones    │                                                  │
│ - Layers   ├─────────────────────────────────────────────────┤
│            │  Map Controls: Zoom | Measure | Toggle All FOV  │
├────────────┴─────────────────────────────────────────────────┤
│  Bottom Toolbar: Place Camera | Draw Polygon | Draw Line |   │
│                  Select | Pan | Delete | Undo | Redo          │
└──────────────────────────────────────────────────────────────┘
```

### Left Panel Tabs

- **Cameras:** List of all camera instances in the project. Click to select and highlight. Visibility toggle per camera.
- **Zones:** List of all drawn polygons/lines. Click to select/highlight.
- **Layers:** Global toggles — show/hide all FOVs, show/hide all zones, basemap style selector.
- **Models:** Camera model library management (add, edit, delete templates).

### Camera Right-Click / Click Context Panel

When a camera is selected, a slide-in or floating panel shows:

- Camera label (editable)
- Camera model (dropdown to swap)
- Bearing (numeric input + compass dial)
- FOV angle override (input)
- Range override (input)
- Color picker
- FOV visibility toggle
- Delete button

---

## 10. Multi-User Considerations

### Concurrent Editing Strategy

- **Optimistic updates:** Frontend applies changes immediately; server confirms or rolls back.
- **Last-write-wins** for camera position updates (acceptable for survey tool use case).
- **WebSocket broadcast:** When one user moves a camera, all other connected users in that project receive a `camera_moved` event and the map updates live.
- **Presence indicators:** Show avatars/initials of other active users on the project header.

### Permissions Enforcement

- All write operations validated server-side against the requesting user's project role.
- `viewer` role receives `403 Forbidden` on any mutating operation.
- Project `owner` can transfer ownership or remove collaborators.

---

## 11. Report and Export

### PDF Report

Report generation uses a **client-side canvas export** approach. The map image is captured in the browser and sent to the server, which embeds it into the PDF alongside compiled project data. This avoids any server-side rendering dependencies and guarantees the map image matches exactly what the user sees.

**Workflow:**

1. User clicks "Generate Report" in the UI.
2. Frontend captures the current map canvas as a base64 PNG using `leaflet-image` or the MapLibre `map.getCanvas().toDataURL()` method.
3. Frontend sends a `POST /projects/{id}/report` request with the base64 map image included in the request body alongside any report options.
4. Backend compiles project data from the DB (cameras, zones, coverage summary).
5. Backend renders an HTML template (Jinja2) with the received map image embedded and data tables populated.
6. WeasyPrint converts the HTML/CSS to PDF.
7. PDF is streamed back to the client as a file download.

**CORS Tile Caveat:** Leaflet canvas export will throw a security error if OSM tiles are loaded cross-origin without correct CORS headers. This is resolved by either using a tile provider that sets CORS headers (e.g. MapTiler, Stadia Maps), or proxying tile requests through the backend server so they appear same-origin to the browser.

### KML Export

- `simplekml` Python library generates the KML structure.
- Camera positions → `Placemark` with `Point` geometry, name, and description (model, bearing, range).
- FOV sectors → `Placemark` with `Polygon` geometry, styled with semi-transparent fill.
- Drawn zones → `Placemark` with `Polygon` or `LineString` geometry.
- All exported to a single `.kml` file, optionally bundled as `.kmz` with icon assets.

---

## 12. Development Phases

### Phase 1 — Foundation (Weeks 1–3)

- Project scaffolding: monorepo or separate frontend/backend repos
- Backend: FastAPI project structure, MongoDB connection, User auth (register/login/JWT)
- Frontend: React + Vite setup, Leaflet map with OSM tiles, basic routing and auth screens
- DB schema implementation (Users, Projects, CameraModels, CameraInstances, Zones)

### Phase 2 — Core Map Features (Weeks 4–6)

- Camera model CRUD (UI + API)
- Project creation and management (UI + API)
- Place camera on map by click
- Drag-to-reposition camera
- Bearing rotation via UI handle
- FOV polygon generation (server-side GIS logic)
- FOV rendering on map (GeoJSON layer)
- Show/hide FOV toggle (per camera and global)

### Phase 3 — Drawing and Collaboration (Weeks 7–9)

- Polygon drawing tool (Leaflet.draw integration)
- Polyline drawing tool
- Zone labelling and colour coding
- Auto-save and manual save
- WebSocket setup for real-time collaboration
- Multi-user presence (avatar display)
- Role-based access control enforcement

### Phase 4 — Reports and Export (Weeks 10–11)

- PDF report generation (template + WeasyPrint)
- KML export
- Coverage area summary calculations (total m² covered)
- Per-camera data tables in report

### Phase 5 — Polish and Hardening (Week 12)

- Full responsive layout review
- Error states and loading indicators throughout
- Input validation (frontend + backend)
- Unit tests for FOV geometry calculations
- Integration tests for key API flows
- Performance review (large projects with 50+ cameras)
- Deployment setup (Docker Compose, environment config)

---

## 13. Open Questions and Risks

| # | Question / Risk | Priority | Decision / Notes |
|---|---|---|---|
| 1 | **CORS headers for canvas tile export** — Leaflet/MapLibre canvas capture fails if tile images lack CORS headers. | ~~High~~ CLOSED | **Stadia Maps** selected as tile provider. CORS-friendly and free tier available. Use Stadia Maps tile URL in both the map client and tile proxy config. |
| 2 | **Camera model library scope** — Per-user private models only, or a shared global library? | ~~Medium~~ CLOSED | **Per-user private models only.** No shared global library. Each user manages their own camera model library. No curation or moderation overhead required. |
| 3 | **FOV polygon accuracy vs. true arc** — The 4-point approximation slightly understates coverage at arc edges. For typical FOV angles (40°–120°) this is negligible. | Low | Document the approximation in the report footer as a planning-tool caveat. No change required. |
| 4 | **Conflict resolution for concurrent edits** — Last-write-wins vs. stricter handling. | ~~Medium~~ CLOSED | **Last-write-wins** confirmed for V1. Acceptable for survey planning use case. WebSocket broadcast ensures all users see the latest state promptly. |
| 5 | **KML icon assets** — Custom camera icons in KMZ require bundled image assets. | Low | Use standard Google Earth icon URI as fallback. No change required. |
| 6 | **Undo/redo scope** — Client-side stack vs. server-side version history. | ~~Low~~ CLOSED | **Not required for V1.** Removed from scope entirely. Can be revisited in a future release if user feedback demands it. |
| 7 | **OpenStreetMap tile usage policy** — Production use requires a commercial tile provider. | ~~High~~ CLOSED | **Free tier only.** Stadia Maps free tier selected (resolves Risk 1 simultaneously). Monitor usage limits; upgrade plan if tile request volume exceeds free tier thresholds. |
| 8 | **Map projection accuracy** — Large coverage areas may have FOV distortion with naive Mercator math. | Low | Use pyproj geodesic for all distance/bearing computation. No change required. |

---

*Document prepared for pre-development review. All decisions marked "TBD" or "stretch goal" should be confirmed before Phase 1 begins.*
