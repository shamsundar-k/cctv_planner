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

Export three hooks:
- `useLeafletMap()` — unchanged, returns `map`
- `useCameraLayer()` — returns `cameraLayer`
- `useFovLayer()` — returns `fovLayer`

### 2. MapCanvas (`MapCanvas.tsx`)

On map initialisation:
- Create `L.layerGroup().addTo(leafletMap)` for cameras
- Create `L.layerGroup().addTo(leafletMap)` for FOV polygons
- Pass all three (`map`, `cameraLayer`, `fovLayer`) into `MapContext.Provider`

On map teardown (unmount):
- Both LayerGroups are removed automatically when the map is destroyed — no explicit cleanup needed beyond the existing `map.remove()` call

### 3. CameraMarker (`CameraMarker.tsx`)

- Replace `useLeafletMap()` with `useCameraLayer()`
- Change `marker.addTo(map)` → `marker.addTo(cameraLayer)`
- All other logic (icon updates, position updates, click handling) unchanged

### 4. FovPolygon (`FovPolygon.tsx`)

- Replace `useLeafletMap()` with `useFovLayer()`
- Change `polygon.addTo(map)` → `polygon.addTo(fovLayer)`
- Remove the `showFovPolygons` check that called `.remove()` — global toggle moves to `FovLayer`
- Per-camera hide (`hiddenCameraIds`) logic remains unchanged

### 5. FovLayer (`FovLayer.tsx`)

Add a `useEffect` that watches `showFovPolygons` and the `fovLayer` group:

```ts
useEffect(() => {
  if (!fovLayer || !map) return
  if (showFovPolygons) {
    fovLayer.addTo(map)
  } else {
    fovLayer.remove()
  }
}, [showFovPolygons, fovLayer, map])
```

This bulk-toggles all FOV polygons with a single Leaflet call instead of each `FovPolygon` managing its own removal.

## Files Changed

| File | Change |
|---|---|
| `MapContext.tsx` | New `MapLayers` shape; add `useCameraLayer`, `useFovLayer` hooks |
| `MapCanvas.tsx` | Create both `LayerGroup`s on init; pass to context |
| `CameraMarker.tsx` | Use `useCameraLayer()`; `addTo(cameraLayer)` |
| `FovPolygon.tsx` | Use `useFovLayer()`; `addTo(fovLayer)`; remove global toggle logic |
| `FovLayer.tsx` | Add bulk-toggle effect |

## Out of Scope

- UI controls for toggling the camera marker layer (cameras are always visible)
- Any changes to `hiddenCameraIds` per-camera hide logic
- Changes to `CameraLayer.tsx` (no Leaflet primitives owned there)
