# Dedicated Leaflet LayerGroups for Camera Markers and FOV Polygons

**Date:** 2026-03-24
**Status:** Approved

## Problem

`CameraMarker` and `FovPolygon` both call `.addTo(map)` directly, placing every Leaflet primitive on the root map with no grouping. There is no layer ordering, no z-index separation between cameras and FOV polygons, and no clean bulk-toggle mechanism.

## Goal

- Give camera markers and FOV polygons each a dedicated `L.layerGroup()` added to the map
- Camera markers are always visible (no toggle needed)
- FOV polygons can be bulk-toggled on/off via the existing `showFovPolygons` store flag
- Individual camera hide (`hiddenCameraIds`) remains per-polygon as today

## Approach: LayerGroups in MapContext (Option B)

Extend `MapContext` to expose `cameraLayer` and `fovLayer` alongside the existing `map`. All consumers pull from context via hooks — no prop drilling, consistent with the current `useLeafletMap()` pattern.

## Design

### 1. MapContext (`MapContext.tsx`)

Change the context value from `LeafletMap | null` to a shape:

```ts
interface MapLayers {
  map: LeafletMap | null
  cameraLayer: LayerGroup | null
  fovLayer: LayerGroup | null
}
```

Export three hooks that each extract their field from the `MapLayers` context value:
- `useLeafletMap()` — returns `ctx.map` (same return type `LeafletMap | null` as today — all existing consumers unchanged)
- `useCameraLayer()` — returns `ctx.cameraLayer`
- `useFovLayer()` — returns `ctx.fovLayer`

All three hooks must extract their value from the `MapLayers` shape. Returning the raw context object from any hook would break consumers silently.

### 2. MapCanvas (`MapCanvas.tsx`)

On map initialisation:
- Create `L.layerGroup().addTo(leafletMap)` for cameras
- Create `L.layerGroup().addTo(leafletMap)` for FOV polygons
- Store all three values in a **single `useState<MapLayers>` object** and update them with one `setState` call inside the `import('leaflet').then()` callback. This ensures all three fields transition from `null` to non-null in the same React render, preventing any window where `map` is set but the LayerGroups are still `null`.
- Pass the state object into `MapContext.Provider`

On map teardown (unmount):
- Both LayerGroups are removed automatically when the map is destroyed — no explicit cleanup needed beyond the existing `map.remove()` call.

**Note on z-order:** After a `fovLayer.remove()` / `fovLayer.addTo(map)` cycle, Leaflet re-appends the layer's pane element at the current moment. Z-order within the overlay pane is not guaranteed to be preserved across hide/show cycles. This is acceptable for the current use case (no other layers are dynamically inserted), but any future work that introduces additional overlay layers should account for this.

### 3. CameraMarker (`CameraMarker.tsx`)

- Replace `useLeafletMap()` with `useCameraLayer()`
- Change `marker.addTo(map)` → `marker.addTo(cameraLayer)`
- Guard: `if (!cameraLayer || !camera) return` (was `!map`)
- All other logic (icon updates, position updates, click handling) unchanged

### 4. FovPolygon (`FovPolygon.tsx`)

- Replace `useLeafletMap()` with `useFovLayer()`
- Change `polygon.addTo(map)` → `polygon.addTo(fovLayer)`
- In the `shouldHide` compound boolean, remove **only** the `showFovPolygons` sub-condition. The remaining guards (`hiddenCameraIds`, missing `target_distance`, non-positive `target_distance`) are untouched.
- Remove `showFovPolygons` from the effect's dependency array.
- Per-camera hide (`hiddenCameraIds`) logic remains unchanged.

### 5. FovLayer (`FovLayer.tsx`)

Add a `useEffect` that watches `showFovPolygons` and the `fovLayer` group. `FovLayer` must call **both** `useFovLayer()` and `useLeafletMap()` to get the two values needed:

```ts
const fovLayer = useFovLayer()
const map = useLeafletMap()

useEffect(() => {
  if (!fovLayer || !map) return
  if (showFovPolygons) {
    fovLayer.addTo(map)  // idempotent on first mount — fovLayer is already attached
  } else {
    fovLayer.remove()
  }
}, [showFovPolygons, fovLayer, map])
```

This bulk-toggles all FOV polygons with a single Leaflet call instead of each `FovPolygon` managing its own removal. The `addTo` call on first mount when `showFovPolygons` is `true` is idempotent — Leaflet is a no-op if the layer is already attached.

## Files Changed

| File | Change |
|---|---|
| `MapContext.tsx` | New `MapLayers` shape; add `useCameraLayer`, `useFovLayer` hooks |
| `MapCanvas.tsx` | Create both `LayerGroup`s on init; single `setState<MapLayers>` call; pass to context |
| `CameraLayer.tsx` | No code change — verify `useLeafletMap()` still returns correct type after context migration |
| `CameraMarker.tsx` | Use `useCameraLayer()`; `addTo(cameraLayer)`; update null-guard |
| `FovPolygon.tsx` | Use `useFovLayer()`; `addTo(fovLayer)`; remove `showFovPolygons` from `shouldHide` and dep array |
| `FovLayer.tsx` | Add bulk-toggle effect |

## Out of Scope

- UI controls for toggling the camera marker layer (cameras are always visible)
- Any changes to `hiddenCameraIds` per-camera hide logic
- Z-order improvements for multiple dynamic overlay layers
