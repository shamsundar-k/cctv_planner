# Dedicated Leaflet LayerGroups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give camera markers and FOV polygons each a dedicated `L.layerGroup()` so they are properly grouped, z-ordered, and the FOV layer can be bulk-toggled cleanly.

**Architecture:** Extend `MapContext` to hold a `MapLayers` shape (`map`, `cameraLayer`, `fovLayer`). `MapCanvas` creates both LayerGroups at map init in a single `setState` call. `CameraMarker` and `FovPolygon` pull their group from context via new hooks. `FovLayer` owns the bulk-toggle effect.

**Tech Stack:** React 19, TypeScript, Leaflet, Zustand, Vite (type-check via `pnpm build` in `packages/frontend`)

**Spec:** `docs/superpowers/specs/2026-03-24-leaflet-layer-groups-design.md`

---

## File Map

| File | Action | Responsibility after change |
|---|---|---|
| `packages/frontend/src/components/map/MapContext.tsx` | Modify | Context shape + 3 hooks |
| `packages/frontend/src/components/map/MapCanvas.tsx` | Modify | Creates LayerGroups; single setState |
| `packages/frontend/src/components/map/CameraMarker.tsx` | Modify | Adds marker to `cameraLayer` |
| `packages/frontend/src/components/map/FovPolygon.tsx` | Modify | Adds polygon to `fovLayer`; no global toggle |
| `packages/frontend/src/components/map/FovLayer.tsx` | Modify | Bulk-toggles `fovLayer` on `showFovPolygons` |
| `packages/frontend/src/components/map/CameraLayer.tsx` | Verify | Uses `useLeafletMap()` — confirm unchanged |

---

## Task 1: Migrate MapContext to MapLayers shape

**Files:**
- Modify: `packages/frontend/src/components/map/MapContext.tsx`

- [ ] **Step 1: Replace the file contents**

The current file holds `LeafletMap | null` directly. Replace the entire file with:

```tsx
import { createContext, useContext } from 'react'
import type { Map as LeafletMap, LayerGroup } from 'leaflet'

export interface MapLayers {
  map: LeafletMap | null
  cameraLayer: LayerGroup | null
  fovLayer: LayerGroup | null
}

const defaultLayers: MapLayers = {
  map: null,
  cameraLayer: null,
  fovLayer: null,
}

const MapContext = createContext<MapLayers>(defaultLayers)

export default MapContext

export function useLeafletMap(): LeafletMap | null {
  return useContext(MapContext).map
}

export function useCameraLayer(): LayerGroup | null {
  return useContext(MapContext).cameraLayer
}

export function useFovLayer(): LayerGroup | null {
  return useContext(MapContext).fovLayer
}
```

- [ ] **Step 2: Type-check**

Run from `packages/frontend`:
```bash
pnpm build
```
Expected: TypeScript errors about `MapCanvas.tsx` passing `LeafletMap | null` to a `MapLayers` context — this is correct, we fix it in Task 2. All other files should still compile (hooks return types are unchanged).

> **Note:** If the build fails only on `MapCanvas.tsx`'s `MapContext.Provider value=` line, that is expected. Any other errors are not expected and must be investigated before continuing.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/map/MapContext.tsx
git commit -m "refactor(map): extend MapContext to MapLayers shape with cameraLayer and fovLayer hooks"
```

---

## Task 2: Create LayerGroups in MapCanvas

**Files:**
- Modify: `packages/frontend/src/components/map/MapCanvas.tsx`

- [ ] **Step 1: Replace the useState and context value**

Open `MapCanvas.tsx`. Make the following changes:

**a)** Add `LayerGroup` to the Leaflet import (line 3):
```tsx
import type { Map as LeafletMap, TileLayer, LayerGroup } from 'leaflet'
```

**b)** Replace the existing `import MapContext from './MapContext'` line (line 5) with:
```tsx
import MapContext, { type MapLayers } from './MapContext'
```
> Do NOT add a second import line — replace the existing one to avoid a duplicate identifier error.

**c)** Replace the single `useState<LeafletMap | null>` with a `useState<MapLayers>`:

Change:
```tsx
const [map, setMap] = useState<LeafletMap | null>(null)
```
To:
```tsx
const [layers, setLayers] = useState<MapLayers>({
  map: null,
  cameraLayer: null,
  fovLayer: null,
})
```

**d)** Inside the `import('leaflet').then((L) => { ... })` callback, replace `setMap(leafletMap)` with the three-line block. The surrounding context should look like this after the change:

```tsx
mapRef.current = leafletMap

const cameraLayer = L.layerGroup().addTo(leafletMap)
const fovLayer = L.layerGroup().addTo(leafletMap)
setLayers({ map: leafletMap, cameraLayer, fovLayer })

const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY
const tileLayer = L.tileLayer(buildTileUrl(basemapStyle, stadiaKey), {
```

> The tile layer creation lines below remain unchanged — only `setMap(leafletMap)` is replaced.

**e)** In the cleanup (return):
```tsx
// existing:
mapRef.current.remove()
mapRef.current = null
tileLayerRef.current = null
setMap(null)

// replace setMap(null) with:
setLayers({ map: null, cameraLayer: null, fovLayer: null })
```

**f)** Update all references from `map` to `layers.map` in the remaining effects:
- The basemap tile layer effect uses `tileLayerRef.current` — no change needed
- The cursor effect: `mapRef.current.getContainer()` — no change needed (uses ref not state)
- The deselect-on-click effect uses `mapRef.current` — no change needed

**g)** Update the Provider to pass the full `layers` object:
```tsx
// change:
<MapContext.Provider value={map}>
// to:
<MapContext.Provider value={layers}>
```

- [ ] **Step 2: Type-check**

```bash
pnpm build
```
Expected: Clean compile — no errors. `MapCanvas` now supplies a valid `MapLayers` to the context.

- [ ] **Step 3: Verify in browser**

Start the dev server (`pnpm dev` from repo root). Open a project with cameras. Confirm:
- Camera markers appear on the map
- FOV polygons appear on the map
- The FOV toggle button (eye icon) hides/shows polygons

> The FOV toggle may stop working correctly after this step because `FovPolygon` still reads `showFovPolygons` itself — that's fixed in Tasks 4 and 5. Markers must still appear.

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/components/map/MapCanvas.tsx
git commit -m "refactor(map): create cameraLayer and fovLayer LayerGroups in MapCanvas"
```

---

## Task 3: Migrate CameraMarker to useCameraLayer

**Files:**
- Modify: `packages/frontend/src/components/map/CameraMarker.tsx`

- [ ] **Step 1: Update the import and hook call**

In `CameraMarker.tsx`:

**a)** Change the import from `MapContext.tsx` (line 11):
```tsx
// change:
import { useLeafletMap } from './MapContext'
// to:
import { useCameraLayer } from './MapContext'
```

**b)** Replace the hook call (line 43):
```tsx
// change:
const map = useLeafletMap()
// to:
const cameraLayer = useCameraLayer()
```

- [ ] **Step 2: Update the creation effect guard and addTo call**

In the creation `useEffect` (lines 52–84):

**a)** Update the guard at the top:
```tsx
// change:
if (!map || !camera) return
// to:
if (!cameraLayer || !camera) return
```

**b)** Update `addTo`:
```tsx
// change:
}).addTo(map)
// to:
}).addTo(cameraLayer)
```

**c)** The `useEffect` dependency array on line 84 is `[map]` — change to `[cameraLayer]`:
```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [cameraLayer])
```

> **Note:** The `selectedCameraIdRef` and `setSelectedCamera` closure inside the marker click handler do not use `map` — they are untouched.

- [ ] **Step 3: Type-check**

```bash
pnpm build
```
Expected: Clean compile.

- [ ] **Step 4: Verify in browser**

Open a project. Place cameras. Confirm:
- Camera markers appear at correct positions
- Clicking a marker selects it (ring highlight appears)
- Clicking another marker deselects the first

- [ ] **Step 5: Commit**

```bash
git add packages/frontend/src/components/map/CameraMarker.tsx
git commit -m "refactor(map): migrate CameraMarker to useCameraLayer"
```

---

## Task 4: Migrate FovPolygon to useFovLayer and remove global toggle logic

**Files:**
- Modify: `packages/frontend/src/components/map/FovPolygon.tsx`

- [ ] **Step 1: Update the import and hook call**

**a)** Change the import from `MapContext.tsx` (line 12):
```tsx
// change:
import { useLeafletMap } from './MapContext'
// to:
import { useFovLayer } from './MapContext'
```

**b)** Replace the hook call (line 31):
```tsx
// change:
const map = useLeafletMap()
// to:
const fovLayer = useFovLayer()
```

**c)** Remove the `showFovPolygons` store subscription (line 27 — no longer needed here):
```tsx
// delete this line:
const showFovPolygons = useMapViewStore((s) => s.showFovPolygons)
```
> `useMapViewStore` is still used on other lines in this file (`cameraInstances`, `selectedCameraId`, `hiddenCameraIds`) — do NOT remove the `useMapViewStore` import.

- [ ] **Step 2: Update shouldHide and addTo**

In the main `useEffect` (lines 44–116):

**a)** Remove `showFovPolygons` from the `shouldHide` compound boolean. The current block looks like:
```tsx
const shouldHide =
  !showFovPolygons ||
  hiddenCameraIds.includes(camera.id) ||
  !camera.target_distance ||
  camera.target_distance <= 0
```
Change to:
```tsx
const shouldHide =
  hiddenCameraIds.includes(camera.id) ||
  !camera.target_distance ||
  camera.target_distance <= 0
```

**b)** Update the `addTo` call (inside `import('leaflet').then`):
```tsx
// change:
polygonRef.current = L.polygon(latlngs, style).addTo(map)
// to:
polygonRef.current = L.polygon(latlngs, style).addTo(fovLayer)
```

**c)** Update the guard at the top of the effect:
```tsx
// change:
if (!map || !camera || !importedItems) return
// to:
if (!fovLayer || !camera || !importedItems) return
```

**d)** Remove `showFovPolygons` from the effect dependency array (line 117):
```tsx
// change:
}, [camera, selectedCameraId, showFovPolygons, hiddenCameraIds, importedItems, map])
// to:
}, [camera, selectedCameraId, hiddenCameraIds, importedItems, fovLayer])
```

- [ ] **Step 3: Type-check**

```bash
pnpm build
```
Expected: Clean compile.

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/components/map/FovPolygon.tsx
git commit -m "refactor(map): migrate FovPolygon to useFovLayer, move global toggle ownership to FovLayer"
```

---

## Task 5: Add bulk-toggle effect to FovLayer

**Files:**
- Modify: `packages/frontend/src/components/map/FovLayer.tsx`

- [ ] **Step 1: Add imports and the bulk-toggle effect**

Replace the entire file with:

```tsx
/**
 * FovLayer (FovPolygonLayer) — orchestrates per-camera FOV polygons.
 *
 * Subscribes only to `cameraIds` from the Zustand store, so it re-renders
 * only when a camera is added or removed — never when a camera's properties
 * change.  Each <FovPolygon> manages its own polygon and subscribes to its
 * own slice of the store.
 *
 * Also owns the global showFovPolygons toggle by bulk-adding/removing the
 * fovLayer LayerGroup from the map.
 */
import { useEffect } from 'react'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useLeafletMap, useFovLayer } from './MapContext'
import FovPolygon from './FovPolygon'

interface FovLayerProps {
  projectId: string
}

export default function FovLayer({ projectId }: FovLayerProps) {
  const cameraIds = useMapViewStore((s) => s.cameraIds)
  const showFovPolygons = useMapViewStore((s) => s.showFovPolygons)
  const fovLayer = useFovLayer()
  const map = useLeafletMap()

  // ── Bulk-toggle the entire FOV layer ────────────────────────────────────
  // fovLayer.addTo(map) is idempotent when called while already attached.
  useEffect(() => {
    if (!fovLayer || !map) return
    if (showFovPolygons) {
      fovLayer.addTo(map)
    } else {
      fovLayer.remove()
    }
  }, [showFovPolygons, fovLayer, map])

  return (
    <>
      {cameraIds.map((id) => (
        <FovPolygon key={id} cameraId={id} projectId={projectId} />
      ))}
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm build
```
Expected: Clean compile with zero errors.

- [ ] **Step 3: Full manual verification**

Start the dev server. Open a project with at least two cameras. Verify all of the following:

**Camera markers:**
- [ ] Markers appear at correct positions
- [ ] Clicking a marker selects it (ring highlight)
- [ ] Clicking the map background deselects it
- [ ] Placing a new camera (place-camera tool) adds a marker immediately

**FOV polygons:**
- [ ] FOV polygons render in correct position/bearing
- [ ] The FOV toggle button hides all FOV polygons at once
- [ ] Re-enabling the toggle shows all FOV polygons again
- [ ] Hiding an individual camera hides only its FOV polygon (sidebar hide toggle)
- [ ] Selecting a camera makes its FOV polygon more opaque

**Layer structure (open browser DevTools → inspect map container):**
- [ ] Confirm there are two `<div>` layer group containers inside the Leaflet overlay pane (one for cameras, one for FOV) — they should be siblings, not nested. Leaflet LayerGroups render as `<div>` elements, not SVG `<g>` tags.

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/components/map/FovLayer.tsx
git commit -m "refactor(map): add bulk-toggle effect to FovLayer for showFovPolygons"
```

---

## Task 6: Verify CameraLayer is unaffected

**Files:**
- Verify: `packages/frontend/src/components/map/CameraLayer.tsx`

- [ ] **Step 1: Confirm hook return type**

Open `CameraLayer.tsx`. It calls `useLeafletMap()` at line 27 to get `map` for `map.on('click', handler)`. After our changes, `useLeafletMap()` still returns `LeafletMap | null` (unchanged). No code change is needed.

Confirm the type-check already passed in Task 5 Step 2 — if so, this task is complete.

- [ ] **Step 2: Commit (if nothing changed)**

No commit needed — this is a verification-only step.

---

## Done

All camera markers now live in `cameraLayer`, all FOV polygons in `fovLayer`. The FOV layer can be bulk-toggled by `FovLayer` via `fovLayer.remove()` / `fovLayer.addTo(map)` without any individual polygon needing to manage its own global visibility.
