# Camera Instance Store — Architecture & Implementation Guide

> Documents the Zustand store design for camera instance state management in the CCTV Survey Planner map editor. This is a decision record and implementation reference — not a code guide.

---

## 1. Design Goals

| Goal | Decision |
|---|---|
| Real-time map feedback | All edits are local-first — no network round-trip on placement or edit |
| No marker flicker on save | `clientId` is the stable React/Zustand key — never changes |
| Explicit save semantics | User controls when data is flushed to server via Save button |
| No React Query dependency | Store owns full data lifecycle — single straight-line data flow |
| Mismatch-proof structure | Camera data and sync state live under one key — structural guarantee |
| Efficient re-renders | Per-camera selectors with shallow equality — unchanged cameras skip render |

---

## 2. ID Strategy

Only one ID exists on the frontend — `client_id`. The server's internal MongoDB `_id` is never surfaced to the client.

### client_id

- Generated client-side via `uuidv4()` inside `generateDefaultCameraInstance` at placement time
- Generated once — never changes for the lifetime of the camera
- Used as the React key prop on `CameraMarker`, the Zustand store key, and the `clientIds` array
- Sent to server in POST payload and persisted in MongoDB
- Returned by server on all GET responses — `loadCameras` uses it directly as store key
- Used as the URL param for PUT and DELETE routes — server routes by `(project_id, client_id)`
- Enables idempotent POST retry — server detects duplicate `client_id` per project and returns the existing camera instead of creating a second one

### Why serverId is absent

The server routes all operations by `client_id`. MongoDB's internal `_id` is never needed on the frontend. Keeping `serverId` out of the client eliminates a nullable field, simplifies tracking, and removes an entire category of POST-to-PUT transition logic.

### Rule

The rendering pipeline, store keys, and API routing all use `client_id` exclusively. MongoDB's `_id` is a server-internal detail.

---

## 3. Core Data Structures

### CameraRecord

The fundamental unit in the store. Every camera in the system is represented as a `CameraRecord` containing two strictly separated parts:

**camera** — pure domain data matching the server contract exactly. This is what gets serialised and sent in POST and PUT payloads. It contains no client-side state. Fields include position, bearing, height, focal length, colour, FOV GeoJSON, and `clientId`.

**tracking** — client-side sync state that never leaves the store. Contains `isNew`, `isDirty`, `status`, and `error`. This is the store's view of where the camera stands in its save lifecycle.

The boundary between these two parts is the key architectural invariant. Mixing them would couple the server contract to client concerns and cause payload pollution on every API call.

### CameraTrackingEntry fields

| Field | Type | Purpose |
|---|---|---|
| `isNew` | boolean | True = camera has never been saved — needs POST. False = exists on server — needs PUT if dirty |
| `isDirty` | boolean | True means camera has changes that need to be sent to server on next save cycle |
| `status` | CameraSaveStatus | Current position in save lifecycle — drives UI feedback |
| `error` | string or null | Populated on failure — shown as per-camera error indicator |

### CameraSaveStatus values

| Status | Meaning |
|---|---|
| `pending` | Has unsaved changes, not yet attempted |
| `saving` | Request is in flight — excluded from next Save press |
| `saved` | Server-confirmed, no outstanding changes |
| `failed` | Last attempt failed — will retry on next Save press |

### Store-level state

**clientIds** — ordered array of `clientId` strings. Drives the list of `CameraMarker` components rendered by `CameraLayer`. Only changes when a camera is added or removed — never when a camera's properties change.

**cameraRecords** — Record keyed by `clientId`. Each entry is a `CameraRecord`. This is the single source of truth for all camera data and sync state in the session.

**deletedCameras** — Set of `clientId` strings for cameras removed from the map that still need a DELETE request sent to the server. A camera's `CameraRecord` is removed from `cameraRecords` immediately on deletion — `deletedCameras` retains the `clientId` needed for the DELETE URL param. Only ever contains cameras where `isNew` was false — cameras that were never saved are dropped entirely without a server call.

**isLoading / loadError** — page-mount fetch lifecycle state.

---

## 4. Mismatch Prevention

Previous architectures used parallel maps (e.g. separate `cameraInstances` and `saveStatus` records both keyed by the same ID). This creates a class of bugs where the two maps drift apart — an entry exists in one but not the other.

The `CameraRecord` wrapper eliminates this entirely. A `clientId` either exists in `cameraRecords` with both `camera` and `tracking` present, or it does not exist at all. There is no intermediate state.

### Enforcement rules

- `addCamera` is the only action that creates a new key in `cameraRecords`
- `removeCamera` is the only action that deletes a key from `cameraRecords`
- `updateCamera` and `updateTracking` only patch existing entries — they are no-ops on unknown keys
- A dev-mode warning fires if `updateCamera` is called with an unknown `clientId`
- No other code path may directly mutate `cameraRecords` keys

---

## 5. clientId Ownership

`clientId` is generated exactly once — inside `generateDefaultCameraInstance` — before `addCamera` is called. The store does not generate `clientId`. This means:

- The caller (CameraLayer) receives the `clientId` back from `addCamera` and uses it immediately for selection
- `clientId` is included in the POST payload so the server persists it
- On page reload, `loadCameras` receives cameras from the server with their `clientId` already present — it uses these directly as store keys without generating new IDs
- This makes store keys stable across sessions, not just within a session

---

## 6. Data Flow

### Page mount

Server GET response feeds directly into `cameraRecords` using the persisted `clientId` as the key. All loaded cameras start with `isNew: false`, `status: saved`, and `isDirty: false`. `deletedCameras` is cleared. No dirty state exists at this point.

### Camera placement

User clicks map → `generateDefaultCameraInstance` creates a camera object with a new `clientId` → `addCamera` adds it to `cameraRecords` with `isNew: true`, `isDirty: true`, `status: pending` → `CameraLayer` receives the returned `clientId` and selects the camera → marker appears on map instantly. No server call occurs.

### Camera editing

User changes a property in the properties panel → `updateCamera` patches the `camera` fields and sets `isDirty: true`, `status: pending`. If the camera is currently `saving`, the status stays `saving` and the edit is buffered — `markSaved` or `markFailed` will handle the transition when the in-flight request settles.

### Camera deletion

- Camera is new (`isNew: true`, never saved): removed from `cameraRecords` and `clientIds` entirely. No server call needed.
- Camera is saved (`isNew: false`): removed from `cameraRecords` and `clientIds`, `clientId` added to `deletedCameras` for the DELETE request.

### Save cycle

Triggered by the Save button. Three sets of operations run in parallel via `Promise.allSettled`:

**POST batch** — all cameras where `isNew` is true, `isDirty` is true, and `status` is not `saving`. Each camera is marked `saving` (isDirty set to false) before the request fires to prevent duplicate sends on rapid Save presses.

**PUT batch** — all cameras where `isNew` is false, `isDirty` is true, and `status` is not `saving`. Same pre-flight marking applies. URL param is `clientId` — server routes by `(project_id, clientId)`.

**DELETE batch** — all entries in `deletedCameras`. URL param is `clientId`. On success, the entry is removed via `markDeleted`. On failure, the entry remains in `deletedCameras` and will be retried on the next Save.

On POST success, `markSaved` sets `isNew: false` — the camera now exists on server. On subsequent edits it will correctly route to PUT. The `clientId` — and therefore the React key and store key — does not change at any point. No marker remount occurs.

On any failure, `markFailed` restores `isDirty: true` and sets `status: failed`. The camera automatically re-enters the next save cycle.

No re-fetch occurs on the happy path. The store already holds the correct state. Re-fetch is only considered for error recovery scenarios outside the normal save cycle.

---

## 7. Save Cycle Derived Selectors

Rather than maintaining `createdIds` and `updatedIds` sets that must be kept in sync, the store derives which cameras need POST or PUT at the moment of saving by filtering `cameraRecords`:

- **Needs POST**: `isNew` is true AND `isDirty` is true AND `status` is not `saving`
- **Needs PUT**: `isNew` is false AND `isDirty` is true AND `status` is not `saving`
- **Needs DELETE**: any entry in `deletedCameras`
- **Is dirty overall**: any camera with `isDirty: true` OR `deletedCameras` is non-empty

This eliminates an entire class of bugs where the sets and the actual camera state drift apart. The source of truth is always the camera's own tracking fields.

---

## 8. Preventing Duplicate In-Flight Requests

If the user presses Save while a previous save cycle is still in progress, the `status: saving` guard prevents re-sending cameras that are already in flight.

`markSaving` sets `isDirty: false` before the request fires — not after. This means the derived selectors naturally exclude in-flight cameras on the next Save press without any additional coordination. If the request fails, `markFailed` restores `isDirty: true` so the camera re-enters the queue.

---

## 9. Rendering Efficiency

### CameraLayer

Subscribes only to `clientIds`. Re-renders only when a camera is added or removed. Property changes on individual cameras are invisible to this component.

### CameraMarker

Subscribes to `cameraRecords[clientId].camera` using a shallow equality comparator. Re-renders only when the specific camera's data fields change. Other cameras' updates do not trigger re-renders.

For save status UI (error badge, spinner), `CameraMarker` additionally subscribes to `cameraRecords[clientId].tracking.status` as a separate selector slice so a status change does not force a full camera data comparison.

### Key stability

Because `CameraMarker` uses `clientId` as its React key and `clientId` never changes, React never unmounts and remounts a marker due to an ID change. This eliminates the flicker that would occur if the store key changed from a temp ID to a server ID after a successful POST.

---

## 10. Navigation Guard

The Save button and unsaved-changes navigation warning both consume `getIsDirty()`. This returns true if any camera in `cameraRecords` has `isDirty: true` or if `deletedCameras` is non-empty. A false return guarantees the map state matches the server state exactly.

---

## 11. Payload Boundary

`buildCreatePayload` and `buildUpdatePayload` explicitly enumerate the fields sent to the server. They extract only `camera` fields — never `tracking` fields. This is the enforcement point for the camera/tracking boundary. Any new client-side field added to `CameraRecord` is automatically excluded from API calls by these builders.

---

## 12. Server-Side Requirements

The server must support the following to align with this architecture:

- `clientId` is a required field on POST — reject requests without it
- Unique index on `(project_id, clientId)` in MongoDB — prevents duplicate cameras from retry storms and enables routing by `clientId`
- POST is idempotent — duplicate `clientId` within the same project returns the existing camera rather than creating a second one
- `clientId` is returned on all GET responses — enables stable store keying across sessions
- PUT routes by `clientId` URL param — `(project_id, clientId)` lookup, not MongoDB `_id`
- DELETE routes by `clientId` URL param — same lookup
- MongoDB `_id` is never surfaced in API responses consumed by the frontend

---

## 13. Key Invariants Summary

| Invariant | Enforcement |
|---|---|
| A `clientId` exists in `cameraRecords` with both `camera` and `tracking` or not at all | Only `addCamera` and `removeCamera` create/delete keys |
| `clientId` never changes after placement | Generated once in `generateDefaultCameraInstance`, store never reassigns it |
| `isNew` transitions from true to false exactly once — on first successful POST | Only `markSaved` sets `isNew: false`; `loadCameras` sets it to false directly |
| No server-internal ID ever appears in the frontend | MongoDB `_id` is absent from all store structures and API response types |
| A camera is never sent to server while already in flight | `status: saving` guard in derived selectors |
| A failed camera always re-enters the save queue | `markFailed` restores `isDirty: true` |
| `deletedCameras` never contains a camera where `isNew` was true | `removeCamera` drops new cameras entirely — never queues them for DELETE |
| `getIsDirty` is always accurate | Derived from actual tracking fields — no separate sets to maintain |
