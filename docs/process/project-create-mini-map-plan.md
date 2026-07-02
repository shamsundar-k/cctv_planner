# Implementation Plan: Mini Map Selector for Project Create Page

## Goal

Add an interactive mini map to the project creation flow so users can select the project's initial GIS location visually instead of only typing latitude and longitude manually.

The existing manual coordinate inputs should remain available for precision editing.

Target component:

```text
packages/frontend/src/features/projects/create/components/ProjectCreateForm.tsx
```

Existing map-related references:

```text
packages/frontend/src/features/map-view/
packages/frontend/src/features/map-view/components/map/Map.tsx
packages/frontend/src/features/map-view/components/map/BaseTile.tsx
packages/frontend/src/config/mapConfig.ts
packages/frontend/src/features/project-manage/components/MapLocationTab.tsx
```

---

## Current State

The project create form currently allows users to enter:

- Latitude
- Longitude
- Zoom

Current state values in `ProjectCreateForm.tsx`:

```ts
const [lat, setLat] = useState("");
const [lng, setLng] = useState("");
const [zoom, setZoom] = useState("15");
```

The form currently submits project map location fields using:

```ts
center_lat: latNum,
center_lng: lngNum,
default_zoom: hasLocation ? zoomNum : null,
```

There is no visual map selector in the create flow.

---

## Existing Useful Implementation

There is already an interactive Leaflet map implementation in:

```text
packages/frontend/src/features/project-manage/components/MapLocationTab.tsx
```

It supports:

- Leaflet map rendering
- Click map to set project center
- Draggable marker
- Zoom tracking
- Coordinate readout
- Saving updated location

This logic should be used as the main reference.

---

## Recommended Architecture

Create a reusable location picker component instead of embedding the full project map view.

Recommended new file:

```text
packages/frontend/src/features/projects/components/ProjectLocationPicker.tsx
```

Alternative location if the project prefers generic shared map components:

```text
packages/frontend/src/components/map/LocationPickerMap.tsx
```

Use the first option unless the project already has a preferred shared map component location.

---

## Why Not Directly Reuse `Map.tsx`

The existing full map component:

```text
packages/frontend/src/features/map-view/components/map/Map.tsx
```

is designed for the full project map experience.

It currently:

- initializes Leaflet
- initializes Geoman controls
- updates global `useMapActionsStore`
- provides map context for overlays and layers
- is used with project map tools such as camera placement

For the project create page, this is too heavy.

The create page only needs:

- map display
- base tile layer
- click-to-select point
- draggable marker
- zoom tracking

Therefore, implement a lightweight picker that reuses Leaflet and `mapConfig.ts`, but does not depend on global map action state or Geoman controls.

---

## New Component: `ProjectLocationPicker`

### File

```text
packages/frontend/src/features/projects/components/ProjectLocationPicker.tsx
```

### Purpose

Reusable Leaflet-based map picker for selecting a latitude, longitude, and zoom.

### Suggested Props

```ts
interface ProjectLocationPickerProps {
  lat: number | null;
  lng: number | null;
  zoom: number | null;
  defaultLat?: number;
  defaultLng?: number;
  defaultZoom?: number;
  height?: number;
  onChange: (value: {
    lat: number;
    lng: number;
    zoom: number;
  }) => void;
}
```

### Default Values

Use the same defaults as the existing manage-location map unless there is a better app-wide default:

```ts
const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;
const DEFAULT_ZOOM = 13;
```

### Behavior

The component should:

1. Render a Leaflet map.
2. Use the provided `lat`, `lng`, and `zoom` if available.
3. Fall back to `defaultLat`, `defaultLng`, and `defaultZoom` if location props are missing.
4. Add a tile layer using `BASE_MAPS` and `DEFAULT_BASE_MAP` from `mapConfig.ts`.
5. Add one draggable marker.
6. Move the marker when the map is clicked.
7. Update marker coordinates when the marker is dragged.
8. Track map zoom changes.
9. Call `onChange({ lat, lng, zoom })` whenever selected position or zoom changes.
10. Clean up the Leaflet map instance on unmount.
11. Round coordinates to 6 decimal places.

---

## Tile Layer Reuse

Use the existing map configuration:

```text
packages/frontend/src/config/mapConfig.ts
```

Import:

```ts
import { BASE_MAPS, DEFAULT_BASE_MAP } from '@/config/mapConfig';
```

Use:

```ts
const baseMap = BASE_MAPS[DEFAULT_BASE_MAP];

L.tileLayer(baseMap.get_url(), {
  attribution: baseMap.attribution,
  maxZoom: 20,
}).addTo(map);
```

This keeps the mini map consistent with the main map configuration.

---

## Leaflet Marker Icon Handling

Follow the existing workaround from:

```text
packages/frontend/src/features/project-manage/components/MapLocationTab.tsx
```

Patch default marker icons after dynamically importing Leaflet:

```ts
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
```

---

## Dynamic Leaflet Import

Use the same pattern as `MapLocationTab.tsx`:

```ts
import('leaflet').then((L) => {
  // initialize map
});
```

Also import Leaflet CSS in the new picker component:

```ts
import 'leaflet/dist/leaflet.css';
```

---

## Coordinate Rounding Helper

Add a local helper in `ProjectLocationPicker.tsx`:

```ts
function roundCoordinate(value: number) {
  return Math.round(value * 1e6) / 1e6;
}
```

Use this when updating lat/lng from map click or marker drag.

---

## Map Initialization Flow

Pseudo implementation:

```ts
useEffect(() => {
  if (!containerRef.current || mapRef.current) return;

  import('leaflet').then((L) => {
    if (!containerRef.current || mapRef.current) return;

    patchLeafletMarkerIcons(L);

    const initialLat = lat ?? defaultLat;
    const initialLng = lng ?? defaultLng;
    const initialZoom = zoom ?? defaultZoom;

    const map = L.map(containerRef.current).setView(
      [initialLat, initialLng],
      initialZoom,
    );

    mapRef.current = map;

    const baseMap = BASE_MAPS[DEFAULT_BASE_MAP];

    L.tileLayer(baseMap.get_url(), {
      attribution: baseMap.attribution,
      maxZoom: 20,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const nextLat = roundCoordinate(pos.lat);
      const nextLng = roundCoordinate(pos.lng);

      onChange({
        lat: nextLat,
        lng: nextLng,
        zoom: map.getZoom(),
      });
    });

    map.on('click', (e) => {
      const nextLat = roundCoordinate(e.latlng.lat);
      const nextLng = roundCoordinate(e.latlng.lng);

      marker.setLatLng([nextLat, nextLng]);

      onChange({
        lat: nextLat,
        lng: nextLng,
        zoom: map.getZoom(),
      });
    });

    map.on('zoomend', () => {
      const pos = marker.getLatLng();

      onChange({
        lat: roundCoordinate(pos.lat),
        lng: roundCoordinate(pos.lng),
        zoom: map.getZoom(),
      });
    });
  });

  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  };
}, []);
```

---

## Sync Manual Inputs Back to Map

The picker should respond when `lat`, `lng`, or `zoom` props change because the create form will keep manual coordinate inputs.

Add a second effect in `ProjectLocationPicker.tsx`:

```ts
useEffect(() => {
  if (!mapRef.current || !markerRef.current) return;
  if (lat == null || lng == null) return;

  markerRef.current.setLatLng([lat, lng]);

  mapRef.current.setView(
    [lat, lng],
    zoom ?? mapRef.current.getZoom(),
    { animate: false },
  );
}, [lat, lng, zoom]);
```

Implementation note:

- Be careful not to cause excessive re-centering during regular map interactions.
- If needed, use refs to track the last emitted values.
- Keep the first implementation simple unless behavior becomes jumpy.

---

## Integrate Into `ProjectCreateForm.tsx`

Modify:

```text
packages/frontend/src/features/projects/create/components/ProjectCreateForm.tsx
```

Import the new component:

```ts
import ProjectLocationPicker from '@/features/projects/components/ProjectLocationPicker';
```

Add the mini map inside the existing `Base Map Location` section, above the coordinate inputs.

Example integration:

```tsx
<ProjectLocationPicker
  lat={latValid ? latNum : null}
  lng={lngValid ? lngNum : null}
  zoom={zoomValid ? zoomNum : null}
  height={260}
  onChange={({ lat, lng, zoom }) => {
    setLat(String(lat));
    setLng(String(lng));
    setZoom(String(zoom));
  }}
/>
```

Keep the existing latitude, longitude, and zoom inputs below the mini map.

---

## Create Form Validation Improvements

Current validation allows partial location input. For example, latitude can be present while longitude is empty.

For a map center, partial coordinates are not useful.

Add pair validation:

```ts
const hasLat = lat !== '';
const hasLng = lng !== '';
const hasLocation = hasLat && hasLng;
const locationEmpty = !hasLat && !hasLng;
const locationPairValid = locationEmpty || hasLocation;
```

Update `canSubmit`:

```ts
const canSubmit =
  nameValid &&
  descValid &&
  latValid &&
  lngValid &&
  locationPairValid &&
  zoomValid &&
  !isPending;
```

Update submit payload:

```ts
const project = await createProject({
  name: name.trim(),
  description: description.trim(),
  center_lat: hasLocation ? latNum : null,
  center_lng: hasLocation ? lngNum : null,
  default_zoom: hasLocation ? zoomNum : null,
});
```

Add a small helper message under the coordinate inputs if only one coordinate is filled:

```tsx
{!locationPairValid && (
  <span className="text-xs text-red-300 mt-1 block">
    Latitude and longitude must be provided together.
  </span>
)}
```

---

## Suggested UI Copy

Existing label can remain:

```text
Base Map Location (optional)
```

Update helper text to:

```text
Click the map or drag the marker to set the initial project location. You can also enter coordinates manually.
```

Mini map should appear before the manual fields.

Suggested layout:

```text
Base Map Location (optional)
Click the map or drag the marker to set the initial project location. You can also enter coordinates manually.

[ mini map, about 260px tall ]

Latitude     Longitude     Zoom
[ input ]    [ input ]     [ input ]
```

---

## Styling Guidance

Use existing form styling from `ProjectCreateForm.tsx`.

Suggested map container class:

```tsx
<div
  ref={containerRef}
  className="h-[260px] w-full overflow-hidden rounded-xl border border-panel-border bg-background"
/>
```

If `height` is a prop, use inline height:

```tsx
<div
  ref={containerRef}
  className="w-full overflow-hidden rounded-xl border border-panel-border bg-background"
  style={{ height }}
/>
```

---

## Optional Follow-up Refactor

After the create page is working, refactor:

```text
packages/frontend/src/features/project-manage/components/MapLocationTab.tsx
```

to use the new `ProjectLocationPicker`.

Example:

```tsx
<ProjectLocationPicker
  lat={lat}
  lng={lng}
  zoom={zoom}
  height={380}
  onChange={({ lat, lng, zoom }) => {
    setLat(lat);
    setLng(lng);
    setZoom(zoom);
  }}
/>
```

Benefits:

- Removes duplicated Leaflet logic
- Keeps create and manage location behavior consistent
- Centralizes tile-layer and marker behavior

This refactor is optional for the first implementation and can be done after the create-page mini map is verified.

---

## Proposed File Changes

### Add

```text
packages/frontend/src/features/projects/components/ProjectLocationPicker.tsx
```

### Modify

```text
packages/frontend/src/features/projects/create/components/ProjectCreateForm.tsx
```

### Optional Modify

```text
packages/frontend/src/features/project-manage/components/MapLocationTab.tsx
```

---

## Implementation Order

### Phase 1: Build Reusable Picker

Create `ProjectLocationPicker.tsx` with:

- Leaflet CSS import
- dynamic Leaflet import
- marker icon patch
- tile layer from `mapConfig.ts`
- draggable marker
- click-to-set marker
- zoom tracking
- cleanup on unmount

### Phase 2: Integrate Into Create Form

Update `ProjectCreateForm.tsx`:

- import the picker
- render the picker in the `Base Map Location` section
- sync picker changes to `lat`, `lng`, and `zoom` state
- keep manual coordinate fields below the map

### Phase 3: Tighten Validation

Update create form validation:

- location remains optional
- if entered manually, latitude and longitude must both be present
- submit `null` for location fields when no location is selected

### Phase 4: Optional Manage-Page Refactor

Refactor `MapLocationTab.tsx` to reuse `ProjectLocationPicker`.

### Phase 5: Validate

Run frontend checks:

```bash
pnpm --filter frontend lint
pnpm --filter frontend build
```

Manual browser validation:

1. Open the create project page.
2. Confirm the mini map loads.
3. Click on the map.
4. Confirm latitude and longitude inputs update.
5. Drag the marker.
6. Confirm latitude and longitude inputs update.
7. Zoom the map.
8. Confirm zoom input updates.
9. Manually edit latitude and longitude.
10. Confirm the marker moves to the manually entered point.
11. Submit the project.
12. Open the project map and confirm the initial center and zoom are correct.

---

## Acceptance Criteria

The implementation is complete when:

- The project create page displays a mini map in the `Base Map Location` section.
- Clicking the mini map updates latitude and longitude fields.
- Dragging the marker updates latitude and longitude fields.
- Zooming the map updates the zoom field.
- Manual coordinate edits move the marker/map when values are valid.
- Latitude and longitude are either both empty or both provided.
- Creating a project with selected location saves `center_lat`, `center_lng`, and `default_zoom` correctly.
- Creating a project without selected location still works and submits null location fields.
- Frontend lint and build pass.

---

## Important Notes for the Implementing Agent

- Keep the change focused and minimal.
- Do not add new map libraries; Leaflet is already used.
- Do not hardcode duplicate tile URLs if `mapConfig.ts` can be used.
- Do not use the full `map-view` `Map.tsx` unless it is first made lightweight/configurable; otherwise it brings unnecessary global state and controls into the create form.
- Preserve the existing manual coordinate inputs.
- Prefer consistency with existing code style in `ProjectCreateForm.tsx` and `MapLocationTab.tsx`.
