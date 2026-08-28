# DORI Regions in 2D FOV Projections — Implementation Plan

## Goal

Add an optional DORI overlay to the existing top-view and side-view SVG projections in `packages/frontend/src/features/fov-visualiser`. The overlay will show the traditional Detection, Observation, Recognition, and Identification distance regions for the selected camera and focal length. A single projection-level control will show or hide the overlay in both views without hiding the underlying FOV geometry.

This plan uses the traditional IEC 62676-4:2014 DORI pixel-density thresholds because the requested feature is specifically DORI. It does not attempt to implement the newer IEC 62676-4:2025 Visual Performance framework.

## Product decisions

- Default the overlay to **shown** after a valid camera is selected so the feature is discoverable.
- Use one shared `Show DORI regions` toggle for both projections. Do not create independent top/side states that can drift apart.
- Keep the visibility choice local to the FOV visualiser. Do not persist it to the backend or the map workspace.
- Show a compact legend whenever the overlay is visible. Each entry includes the region name and threshold so meaning is not conveyed by colour alone.
- Keep target plane, dimensions, camera symbols, ray outlines, warnings, and angle labels above the coloured bands.
- Do not change camera records, API contracts, or backend calculations. The existing camera response already contains the horizontal resolution needed for DORI.

## DORI calculation model

Use these feature constants:

| Region | Minimum horizontal pixel density |
| --- | ---: |
| Identification | 250 px/m |
| Recognition | 125 px/m |
| Observation | 62.5 px/m |
| Detection | 25 px/m |

For horizontal resolution `R`, active horizontal FOV angle `H`, and forward distance `d`:

```text
sceneWidth(d) = 2 × d × tan(H / 2)
pixelDensity(d) = R / sceneWidth(d)
boundaryDistance(threshold) = R / (2 × threshold × tan(H / 2))
```

Build non-overlapping, ordered regions from the calculated boundaries:

```text
0 → Identification maximum
Identification maximum → Recognition maximum
Recognition maximum → Observation maximum
Observation maximum → Detection maximum
```

Anything beyond the Detection maximum is outside the DORI overlay. Clamp render geometry to finite, positive distances and to the projection's supported distance cap. The initial model intentionally uses forward plan distance, matching the existing `w_target` calculation and x-axis semantics. A perspective-corrected or slant-range model would be a separate calculation change and should not be mixed into this UI task.

Reference fixture for calculation checks: at 1920 horizontal pixels and 90° H-FOV, the maximum distances are 3.84 m Identification, 7.68 m Recognition, 15.36 m Observation, and 38.4 m Detection.

## Feature-owned types and utilities

Extend `features/fov-visualiser/types.ts` with:

- `DoriLevel`: `identify | recognize | observe | detect`.
- `DoriBoundary`: level, threshold in px/m, and maximum distance.
- `DoriRegion`: level, threshold, start distance, and end distance.
- `DoriOverlayGeometry`: ordered boundaries, ordered drawable regions, and maximum drawable distance.

Add `features/fov-visualiser/utils/doriGeometry.ts` with:

1. Immutable DORI definitions in highest-to-lowest detail order.
2. A pure `deriveDoriOverlayGeometry(horizontalResolution, horizontalFov)` function.
3. Input guards for missing/non-positive resolution, non-finite values, and FOV values outside `0 < H < 180`.
4. Helpers for clipping region intervals to the visible x-domain without changing their calculated boundary values.

Keep this code within the FOV visualiser feature for now. If the map view later needs the same regions, promote the pure calculation and types to a shared camera/FOV module rather than importing deeply from this feature.

## Hook and data flow

Update `hooks/useFovVisualiser.ts` to:

1. Add `showDoriRegions` state, defaulting to `true`.
2. Derive DORI geometry with `useMemo` from:
   - `selectedModel.sensor_spec.resolution.horizontal`
   - `projectionGeometry.calculation.h_angle`
3. Return `doriGeometry`, `showDoriRegions`, and `onDoriVisibilityChange`.
4. Return `null` DORI geometry when no model is selected or the current projection is invalid.
5. Include the drawable Detection extent when deriving the fit domains, capped consistently with the existing 500 m FOV limit. This ensures the `Fit` action can reveal the full overlay.

Changing mounting height or target geometry should update the FOV clipping/domain as needed. Changing focal length, model, or resolution must recompute the DORI boundaries. Toggling visibility must not recompute camera or FOV mathematics.

## Controls and legend

Add a small projection overlay header above the two `ProjectionPanel` components in `FovVisualiserLayout.tsx` containing:

- A labelled `Show DORI regions` toggle using the existing shared `ToggleSwitch` where its API fits, or an accessible button with `aria-pressed` otherwise.
- A compact `DoriLegend` with four labelled swatches and the px/m thresholds.
- A short tooltip/help label explaining that ranges are theoretical pixel-density limits and actual identification also depends on lighting, focus, angle, motion blur, and compression.

Disable the toggle until valid DORI geometry exists. Hide the legend when the overlay is off. The control applies to both projections and remains available in responsive and fullscreen layouts.

## SVG rendering

### Shared rendering rules

- Add theme tokens for each DORI level's fill and border in all five existing themes: light, dark, blue, green, and high contrast.
- Use translucent fills so the grid remains visible.
- Use labelled boundary lines or compact in-band labels in addition to colour.
- Use stable `useId()`-based SVG definition IDs to avoid collisions between projections.
- Clip all bands to the projection plot and FOV shape.
- Render in this order: grid/base FOV fill, DORI fills, DORI boundaries/labels, FOV rays and target plane, measurements and camera symbol.

### Top view

Add `components/projections/TopViewDoriOverlay.tsx`.

For each DORI interval `[start, end]`, generate a wedge segment using the active horizontal half-angle:

```text
halfWidth(distance) = distance × tan(H-FOV / 2)
```

Each region is a four-point trapezoid, except the first region may collapse to a triangle at the camera origin. Clip each interval to the visible x-domain. The complete overlay remains centred on the camera axis and responds to the existing Visx zoom/pan scales.

Extend the visible top-view ray guides to the drawable DORI/plot extent while retaining the configured target plane and scene-width annotation at `targetDistance`. This avoids showing coloured regions outside the drawn view cone.

### Side view

Add `components/projections/SideViewDoriOverlay.tsx`.

Create an SVG clip path from the top and bottom rays over the drawable distance. Render each DORI interval as a vertical translucent band and clip it to that side-view cone. Clip the rendered result at ground level so below-ground ray geometry is never presented as usable surveillance coverage. Keep the ground, target plane, camera, ray lines, and measurement annotations above the bands.

The side view communicates how the distance bands intersect the mounted camera's vertical cone; it does not recalculate DORI from vertical resolution.

## Expected file changes

```text
packages/frontend/src/features/fov-visualiser/
├── types.ts                                      # DORI types
├── hooks/useFovVisualiser.ts                     # state and derived geometry
├── utils/
│   ├── doriGeometry.ts                           # pure DORI calculations
│   └── projectionDomains.ts                      # include DORI extent in Fit
└── components/
    ├── FovVisualiserLayout.tsx                   # shared visibility control/legend
    ├── dori/
    │   ├── DoriLegend.tsx
    │   └── DoriVisibilityToggle.tsx
    └── projections/
        ├── TopViewProjection.tsx                 # compose top overlay
        ├── TopViewDoriOverlay.tsx
        ├── SideViewProjection.tsx                # compose side overlay
        └── SideViewDoriOverlay.tsx

packages/frontend/src/styles/cctv-themes.css      # DORI theme tokens
```

No backend file should change for this feature.

## Implementation sequence

1. **Pure calculation layer**
   - Add types, constants, formula, validation, and the reference fixture check.
   - Confirm increasing horizontal resolution increases every boundary proportionally and widening H-FOV reduces every boundary.

2. **Hook integration and fit domains**
   - Derive the overlay from the selected model and active interpolated H-FOV.
   - Add shared visibility state.
   - Update projection fit domains without altering zoom/pan behavior.

3. **Top-view overlay**
   - Render non-overlapping wedge bands, boundary lines, and labels.
   - Verify focal-length changes animate/update without stale geometry.

4. **Side-view overlay**
   - Render distance bands clipped to the vertical cone and ground.
   - Verify shallow/upward rays, partial-target coverage, and the 500 m far cap.

5. **Controls, legend, and themes**
   - Add the shared show/hide control and legend.
   - Add colour tokens for every theme and verify labels remain readable without relying on colour.

6. **Regression and responsive verification**
   - Run the frontend lint and production build.
   - Manually verify both projections at normal size, zoomed/panned, fitted, fullscreen, and narrow responsive width.

## Verification matrix

### Calculation checks

- 1920 px at 90° produces 3.84 / 7.68 / 15.36 / 38.4 m boundaries.
- Doubling horizontal resolution doubles every DORI distance.
- A narrower active H-FOV increases every distance.
- Invalid resolution or H-FOV returns no overlay rather than `NaN` SVG coordinates.
- Region intervals are ordered, non-overlapping, and have non-negative lengths.

### Interaction checks

- Overlay is shown by default after selecting a valid camera.
- Turning it off removes all DORI fills, boundaries, labels, and the legend from both views while leaving the base FOV intact.
- Turning it on restores both views without resetting zoom or pan.
- Camera/model/focal changes update DORI immediately.
- `Fit`, zoom, pan, keyboard controls, and fullscreen continue to work.

### Visual checks

- Bands align at exactly the same distances in top and side views.
- The target plane and measurement labels remain legible above the overlay.
- Long DORI ranges are included by `Fit` but can still be inspected by zooming.
- Clipping prevents paint outside the FOV cone, plot bounds, or below ground.
- Every theme has distinguishable fills, readable boundary labels, and acceptable contrast.

### Regression checks

- No-camera, loading, API-error, and invalid-geometry states behave as before.
- Fixed-focal and varifocal cameras both work.
- The coverage results table remains unchanged unless a later product decision explicitly adds DORI values to it.
- Frontend lint and production build pass.

## Out of scope

- Persisting DORI visibility or thresholds.
- User-editable DORI thresholds.
- Replacing DORI with IEC 62676-4:2025 Visual Performance categories.
- Map-view DORI polygons.
- Compensating for lighting, compression, motion blur, facial angle, lens distortion, or AI recognition performance.
- Backend storage or API changes.
