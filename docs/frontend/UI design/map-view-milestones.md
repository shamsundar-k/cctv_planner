# Map View — Implementation Milestones

**Derived from:** `map-view-design.md` v0.1
**Status:** Planning

---

## Overview

The map view is the primary working screen — a full-application shell composed of five regions: Navbar, Left Sidebar, Map Canvas, Right Edit Panel, and Bottom Toolbar. Implementation is split into six milestones ordered by dependency, from the static shell outward to interactive editing and computed outputs.

---

## Milestone 1 — Page Shell & Layout

**Goal:** Render the static layout skeleton with all five regions present and correctly sized. No real data, no interactivity.

### Tasks

- [x] Create `ProjectMapViewPage` route at `/projects/:id` (replace any placeholder)
- [x] Implement top-level CSS grid / flex layout:
  - Navbar fixed at top
  - Bottom toolbar fixed at bottom
  - Workspace row fills remaining height (`calc(100vh - navbar - toolbar)`)
  - Left sidebar (default 236px) + map canvas (flex-1) side by side
- [x] Stub `<Navbar>` with logo placeholder, project name placeholder, save button placeholder, user avatar placeholder
- [x] Stub `<LeftSidebar>` with three tab buttons (Cameras, Layers, Models); no tab content yet
- [x] Stub `<MapCanvas>` rendering a plain Leaflet map centred on `project.center_lat/lng` at `project.default_zoom`
- [x] Stub `<BottomToolbar>` with labelled buttons in correct groups (no actions wired)
- [x] Stub `<RightEditPanel>` rendered but hidden (`display:none` or zero-width)
- [x] Sidebar collapse toggle: clicking the edge button shrinks sidebar to icon rail (44px); expand restores 236px; persisted in component state

### Acceptance Criteria
- All five regions visible and correctly sized in a 1280px+ viewport
- Map tiles load; map pans and zooms freely
- Sidebar collapses and expands without layout shifts
- No console errors

---

## Milestone 2 — Navbar

**Goal:** Fully functional navbar with inline project name editing, save button with status feedback, and user menu.

### Tasks

- [x] **Project name input**
  - Render project name as a `<span>` by default
  - On click, replace with `<input>` pre-filled with current name
  - On `Enter` or blur: validate (non-empty, ≤ 100 chars) → call `PUT /projects/:id` → revert to span
  - On `Escape`: cancel edit, revert to original name
- [x] **Save button**
  - Idle state: "Save" label + last-saved timestamp ("Saved 3 min ago" — formatted relative time, refreshed every 30s)
  - Pending state: spinner icon, button disabled
  - Unsaved indicator: small dot/asterisk on button when local state differs from last save
  - On click: trigger manual save of all dirty camera/zone state
- [x] **User menu**
  - Avatar button opens dropdown: Profile link, Exit Project (→ dashboard), Logout
  - Closes on outside click or `Escape`

### Acceptance Criteria
- Inline name edit commits on Enter/blur, cancels on Escape, calls API
- Save button shows spinner during pending, timestamp updates on success
- Unsaved dot appears when there are local changes; disappears after save
- User menu opens/closes correctly; logout works

---

## Milestone 3 — Left Sidebar Tabs

**Goal:** All three sidebar tabs functional with real data.

### Tasks

#### Cameras Tab
- [ ] Fetch camera instances for the project (`GET /projects/:id/cameras`)
- [ ] Render list rows: colour dot · label · model name · visibility toggle icon
- [ ] Clicking a row selects the camera → sets `selectedCameraId` in global/local state → triggers Right Edit Panel open
- [ ] Selected row is highlighted
- [ ] Visibility toggle icon hides/shows the camera's FOV polygon and icon on the map (local UI state, not persisted until save)
- [ ] Empty state: *"No cameras placed yet. Use the toolbar to place a camera."*

#### Layers Tab
- [ ] Toggle: show/hide all FOV polygons globally
- [ ] Toggle: show/hide all zone polygons globally
- [ ] Toggle: show/hide camera labels on map
- [ ] Base map style selector (Stadia smooth + at least one alternative; calls `setUrl` on Leaflet tile layer)

#### Models Tab (Select Camera Model)
- [ ] Fetch imported camera models for the project (`GET /projects/:id/cameras/models` or equivalent)
- [ ] List rows: model name · manufacturer · type badge
- [ ] Single-selection — selected model is used for "Place Camera" tool
- [ ] Highlight selected row
- [ ] Empty state with link/button to go to Manage → Imported Cameras

### Acceptance Criteria
- Camera list auto-updates when a camera is added or removed
- Clicking a camera row selects it (right panel opens)
- All three layer toggles visibly affect the map
- Selecting a model in the Models tab is required before Place Camera is enabled in the toolbar

---

## Milestone 4 — Bottom Toolbar & Camera Placement

**Goal:** Toolbar tools are wired; users can place, select, and delete cameras on the map.

### Tasks

- [ ] **Tool state machine** — Zustand slice or local state; exactly one active tool at a time
- [ ] Active tool is visually highlighted; all others are default
- [ ] `Escape` key always returns to Select tool
- [ ] **Pan tool** — default Leaflet drag mode (no extra work beyond setting active)
- [ ] **Select tool** — click a camera icon or zone → selects it; click empty map → deselects
- [ ] **Place Camera tool**
  - Disabled (tooltip: "Select a camera model first") if no model selected in Models tab
  - When active, cursor changes to crosshair
  - On map click: call `POST /projects/:id/cameras` with `{model_id, lat, lng, bearing: 0}` → refresh camera list
  - Auto-switch back to Select tool after placement
- [ ] **Draw Polygon tool** — activate Leaflet.draw polygon mode; on complete call `POST /projects/:id/zones`
- [ ] **Draw Line tool** — activate Leaflet.draw polyline mode; on complete call `POST /projects/:id/zones` (type: line)
- [ ] **Measure tool** — click two points; display distance in metres in a floating label; next click resets
- [ ] **Delete tool**
  - Click a camera or zone → show confirmation prompt ("Delete CAM-01?")
  - Confirm → `DELETE /projects/:id/cameras/:cameraId` (or zones); dismiss → cancel
  - After delete: deselect, close right panel if open, refresh lists

### Acceptance Criteria
- Only one tool active at a time; Escape resets to Select
- Place Camera creates a new camera instance visible on map and in sidebar list
- Delete with confirmation removes the camera/zone
- Measure shows correct distance between two clicked points
- Draw Polygon / Draw Line create zone overlays visible on map

---

## Milestone 5 — Map Canvas & Camera Interaction

**Goal:** Camera icons, FOV polygons, DORI overlays, and dragging all work correctly on the map.

### Tasks

#### Camera Icons
- [ ] Render a directional SVG marker for each camera, rotated to `bearing`
- [ ] Selected camera shows a highlighted ring
- [ ] Icons are draggable — on `dragend`: debounce 300ms → `PUT /projects/:id/cameras/:id` with new `{lat, lng}`
- [ ] Clicking or right-clicking an icon selects the camera

#### FOV Polygons
- [ ] Render semi-transparent polygon per camera using backend-computed FOV geometry
- [ ] Each camera has a distinct colour (default palette; user-configurable in Right Edit Panel)
- [ ] Polygon updates whenever camera properties change (focal length, bearing, height)
- [ ] Respects global "Show FOV" toggle from Layers tab

#### DORI Overlay
- [ ] Render dashed concentric rings for the **selected camera only**, representing Identification / Recognition / Observation / Detection distances
- [ ] Colour-coded per DORI level (Identification → red, Recognition → orange, Observation → yellow, Detection → green)
- [ ] Overlay removed when camera is deselected

#### Zone Polygons
- [ ] Render zone polygons (fill + stroke) from `GET /projects/:id/zones`
- [ ] Respects global "Show Zones" toggle

#### Floating Controls
- [ ] Compass / north indicator — top-right floating widget
- [ ] Fit All Cameras button — top-right below compass; on click `map.fitBounds(allCameraPositions, { padding: 40 })`
- [ ] Coordinates display — bottom-left; updates on `mousemove` showing `lat, lng` to 5 decimal places

#### Camera Labels
- [ ] Label overlay per camera showing camera label (e.g. CAM-01)
- [ ] Respects global "Show Camera Labels" toggle

### Acceptance Criteria
- All placed cameras render with correct bearing-rotated icons
- Dragging a camera updates its position and recomputes the FOV polygon
- DORI rings appear only for the selected camera, in the correct colours
- Fit All Cameras flies to a bounding box containing all cameras
- Coordinates display updates live on mouse move

---

## Milestone 6 — Right Edit Panel

**Goal:** Full camera editing — position, bearing, FOV parameters, and DORI read-outs — wired to the backend.

### Tasks

#### Panel Shell
- [ ] Panel slides in from right when `selectedCameraId` is set; slides out on deselect or `Escape`
- [ ] Fixed width ~280px, full height between navbar and toolbar
- [ ] Header: inline-editable camera label (`PUT` on commit), read-only model name subtitle, close button

#### Basic Tab — Placement Section
- [ ] Display lat/lng (read-only, auto-updated on drag)
- [ ] "Move Camera" button re-activates drag mode on the map for this camera

#### Basic Tab — Orientation Section
- [ ] Bearing compass widget: draggable dial + numeric input (0–360°)
- [ ] Changes update `bearing` field → debounced `PUT` → FOV polygon re-rendered on map

#### Basic Tab — FOV Section
- [ ] Focal length slider: range from `camera_model.focal_length_min` to `focal_length_max`
- [ ] Moving slider recomputes H-FOV and V-FOV angles (interpolation per DORI spec) → debounced `PUT` → polygon updates
- [ ] Installation height input (metres, positive float)
- [ ] FOV colour picker → updates polygon fill colour (persisted)
- [ ] FOV visibility toggle (per-camera override)

#### DORI Tab
- [ ] Installation height input (mirrors Basic tab value — shared state)
- [ ] Target distance input (D_far, metres)
- [ ] Target height input (default 1.8m, editable)
- [ ] Read-only computed results:
  - Identification distance (PPM ≥ 250)
  - Recognition distance (PPM ≥ 125)
  - Observation distance (PPM ≥ 62)
  - Detection distance (PPM ≥ 25)
  - PPM at near edge
  - PPM at far edge
  - Total coverage area (m²)
- [ ] Colour-coded label per DORI level
- [ ] Conditional note when any DORI distance exceeds D_far

#### Panel Footer
- [ ] Delete button — confirmation prompt → `DELETE /projects/:id/cameras/:id` → close panel

### Acceptance Criteria
- Bearing compass dial and numeric input stay in sync; map FOV polygon rotates in real time (debounced)
- Focal length slider drives FOV angle recomputation and polygon update
- DORI tab shows correct computed distances that update whenever focal length, height, or bearing changes
- Limiting factor note appears/disappears correctly
- Deleting from the panel closes the panel and removes the camera from map and sidebar

---

## Cross-Cutting Concerns (All Milestones)

| Concern | Notes |
|---|---|
| **Loading states** | Skeleton placeholders for camera list, model list; spinner on save |
| **Error handling** | Toast on any failed `PUT`/`POST`/`DELETE`; inline error on name edit failure |
| **Keyboard accessibility** | `Escape` returns to Select tool; `Escape` closes edit panel; Enter commits inline edits |
| **Responsive minimum** | Minimum supported viewport: 1024px wide (map view is not designed for mobile) |
| **Debounce strategy** | All map-drag and slider `PUT` calls debounced 300ms to avoid request flooding |
| **Query invalidation** | After any mutation, invalidate the relevant TanStack Query key so the sidebar list and map re-render from fresh data |

---

## Deferred (Out of Scope for these Milestones)

| Feature | Deferred to |
|---|---|
| Collaborator presence avatars in navbar | WebSocket / presence design pass |
| Report & KML export buttons | Export feature design |
| Zone edit panel | Post-camera-edit-panel design pass |
| Undo / Redo | v2 |
| Coverage stats bar | Coverage analysis feature |
| Floor plan base layer | v2 |
