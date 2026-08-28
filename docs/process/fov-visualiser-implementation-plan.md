# FOV Visualiser Implementation Plan

## Goal

Implement the approved two-dimensional Field of View visualiser layout as a protected React page. The page will let a user select a bullet-camera model, configure installation values, review calculated coverage metrics, and inspect synchronized top-view and side-view SVG projections with distances and angles.

The implementation will use React 19, TypeScript, Tailwind theme tokens, Visx v4, the existing camera-spec API/query layer, and the existing FOV calculation utilities.

## Scope and constraints

- Add a new protected route at `/tools/fov-visualiser`.
- Keep the existing `/tools/3d-fov-visualiser` route available during implementation so the current tool is not removed unexpectedly.
- Organize the new code under `src/features/fov-visualiser` and expose the page through the feature's public `index.ts`.
- Reuse the existing camera-spec query, camera image support, selector behavior, types, theme tokens, and FOV calculations.
- Restrict the model list to `camera_type === "bullet"` for this visualiser.
- Keep camera selection local to the visualiser so it does not unexpectedly replace the map workspace's selected camera.
- Use SVG for the projections. Do not use Three.js for the top and side diagrams.
- Do not add or change backend endpoints unless an unexpected data gap is found during implementation.
- Testing for this feature will be manual. Do not add a new automated test runner or automated projection tests as part of this work.

## Proposed feature structure

```text
packages/frontend/src/features/fov-visualiser/
├── index.ts
├── FovVisualiserPage.tsx
├── types.ts
├── hooks/
│   └── useFovVisualiser.ts
├── utils/
│   ├── projectionGeometry.ts
│   └── projectionDomains.ts
└── components/
    ├── FovVisualiserLayout.tsx
    ├── SelectedCameraCard.tsx
    ├── CameraConfiguration.tsx
    ├── CoverageResultsTable.tsx
    └── projections/
        ├── ProjectionPanel.tsx
        ├── ProjectionToolbar.tsx
        ├── ProjectionGrid.tsx
        ├── TopViewProjection.tsx
        ├── SideViewProjection.tsx
        ├── AngleMarker.tsx
        └── DimensionMarker.tsx
```

Cross-feature components that are reused should be exported from their owning feature's `index.ts` instead of introducing new deep imports.

## 1. Install the required libraries

Install only the Visx packages used by the visualiser:
User has already installed these. Check for it. Skip if installed
```bash
pnpm --filter frontend add \
  @visx/axis \
  @visx/grid \
  @visx/responsive \
  @visx/scale \
  @visx/shape \
  @visx/zoom
```

Planned responsibilities:

| Package | Responsibility |
| --- | --- |
| `@visx/responsive` | Observe each projection panel and provide its available width and height. |
| `@visx/scale` | Map metres and degrees from the calculation domain to SVG pixel coordinates. |
| `@visx/axis` | Render horizontal and vertical axes, ticks, and metre labels. |
| `@visx/grid` | Render the technical background grid aligned with the axes. |
| `@visx/shape` | Assist with the angle arcs and other path geometry where it is clearer than a handwritten SVG path. |
| `@visx/zoom` | Implement zoom, pan, reset, and Fit behavior for each projection. |

Use native SVG elements for polygons, ray lines, dashed centerlines, text, clipping, target planes, arrowheads, and camera markers.

Completion checks:

- `packages/frontend/package.json` and `pnpm-lock.yaml` contain the new dependencies.
- The frontend still completes its existing TypeScript/Vite build.
- No whole-suite Visx package is installed when the individual packages are sufficient.

## 2. Create the web-app route and feature entry point

1. Create `features/fov-visualiser/index.ts` and export `FovVisualiserPage` from it.
2. Add a protected route in `src/App.tsx`:

   ```text
   /tools/fov-visualiser
   ```

3. Add or update the dashboard tool link so users can reach the new visualiser without typing its URL.
4. Keep `/tools/3d-fov-visualiser` working during the implementation and review checkpoints. Any later redirect or removal should be a separate, explicit cleanup decision.
5. Verify that unauthenticated access follows the existing `ProtectedRoute` behavior.

Completion checks:

- The new route loads directly and survives a browser refresh.
- The dashboard link opens the new route.
- Unknown routes still follow the existing fallback behavior.

## 3. Create the page skeleton

Build the static layout before connecting camera data or projection calculations.

### Page shell

- Page title: `Field of View`.
- Use the existing application background, panel, border, text, and primary-color theme tokens.
- Use the mockup as the visual reference without copying sample manufacturer/model values into business logic.

### Desktop layout

- Left column approximately 340–380 px wide.
- Right column fills the remaining width.
- Left column contains placeholder cards for:
  - Selected camera
  - Configure
  - Coverage results
- Right column contains two stacked, independently bordered projection panels:
  - Top view
  - Side view
- Each projection header contains inactive placeholder controls for zoom out, zoom in, fullscreen, and Fit.

### Responsive behavior

- On wide screens, retain the left/right layout shown in the mockup.
- On narrower screens, stack the left controls above the projection panels.
- Give each projection a practical minimum height so axis labels do not collapse.
- Avoid page-level horizontal scrolling at supported desktop widths.

### Review checkpoint 1 — skeleton layout

After this phase:

1. Allow the user to start the frontend development server.
2. Open `/tools/fov-visualiser` in the live app.
3. Give the user the live URL and allow them to inspect spacing, card sizes, column proportions, responsive behavior, and theme integration.
4. Stop feature implementation at this checkpoint and wait for the user's layout approval or requested adjustments before beginning the left-side feature work.

Checkpoint acceptance criteria:

- The page structure matches the approved layout at a glance.
- Top and side panels receive enough space for detailed engineering diagrams.
- Light, dark, blue, green, and high-contrast theme tokens do not produce unreadable panels.

## 4. Create the left-side camera detail and configuration components

Create presentational components first, using typed props and temporary in-memory values. Do not couple these components directly to API calls.

### Selected camera card

- Camera image area with loading and unavailable-image states.
- Manufacturer/model selection area.
- Camera identity and useful specification chips, including resolution, megapixels, sensor/aspect information when available, camera type, and focal range.
- Empty state prompting the user to choose a camera.

### Configuration card

Implement paired range and numeric controls for:

- Focal length in millimetres
- Mounting height in metres
- Target distance in metres
- Target height in metres

Requirements:

- Keep range and numeric inputs synchronized.
- Show units next to numeric inputs.
- Derive focal-length bounds from the selected camera.
- Disable focal adjustment for a fixed-focal camera where minimum and maximum are equal.
- Clamp invalid or out-of-range values without allowing `NaN` into calculation state.
- Use accessible labels and keyboard-operable native inputs.

Tilt will be calculated from the mounting/target geometry and displayed in the side projection. It should not be introduced as a second independent input unless the calculation model is deliberately changed later.

### Coverage results table

Create a two-column `Metric`/`Value` table for:

- Horizontal FOV
- Vertical FOV
- Scene width at the target distance
- Scene height at the target distance
- Dead zone

Use placeholders while no model is selected or the geometry is invalid. Do not display misleading zero values.

## 5. Connect camera selection to the existing backend flow

Use the existing camera selector as the reference implementation:

- `features/camera-selector/component/ModelSelectorPanel.tsx`
- `features/camera-selector/component/ManufacturerFilter.tsx`
- `features/camera-selector/component/ModelDropdown.tsx`
- `features/camera-selector/component/CameraBrief.tsx`
- `hooks/useCameraSpecs.ts`
- `features/camera-model/components/CameraSpecImage.tsx`

### Reuse strategy

1. Use `useAllCameraSpecs()` so the page receives camera models through the existing TanStack Query cache and `/camera-specs` backend endpoint.
2. Filter the returned models to bullet cameras before deriving manufacturer and model options.
3. Reuse the manufacturer/model selection behavior and visual styles. If an existing component is reused across features, expose it through a public camera-selector feature API instead of adding a new deep import.
4. Reuse the existing camera image URL/version behavior and its loading/error states.
5. Keep `selectedModelId` and visualiser installation values in the visualiser hook. Do not use `useSelectedCameraModelStore` unless product behavior later requires the selection to be shared with the map.

### Selection behavior

- Show a loading skeleton while camera models are being fetched.
- Show an actionable error state when the request fails.
- Show an empty state when the backend has no bullet-camera models.
- Clear an incompatible model when the manufacturer changes.
- When a model is selected:
  - Set focal length to the camera's wide/minimum focal value.
  - Apply the camera's focal, H-FOV, and V-FOV limits.
  - Refresh the selected-camera image and spec chips.
  - Recalculate the results table through `computeFovCartesian`.
- Keep all API mapping and FOV calculation work out of the presentational components.

### Calculation integration

Build a `useFovVisualiser` hook that owns:

- Selected manufacturer and model ID
- Filtered camera list
- Installation input state
- Input normalization and focal-length clamping
- A memoized call to `computeFovCartesian`
- Projection-specific derived geometry
- Loading, error, empty, and invalid-geometry states

Reuse these existing `FovCartesian` values directly:

- `h_angle`
- `v_angle`
- `tilt_angle`
- `top_ray_angle`
- `d_near` as the dead-zone distance
- `d_far`
- `w_target` as scene width at the target distance

Derive the vertical projection at the target in `projectionGeometry.ts` from the top and bottom ray angles. Keep this calculation in real-world metres; pixel conversion belongs only in the projection components.

### Review checkpoint 2 — complete left-side workflow

After the selector, controls, image, and results table are connected:

1. Start the backend and frontend development servers.
2. Open `/tools/fov-visualiser` in the live app.
3. Let the user select several real bullet-camera models and adjust all four inputs.
4. Let the user review camera imagery, selector usability, control density, results formatting, loading/error/empty states, and responsive behavior.
5. Stop at this checkpoint and wait for approval before implementing the final projection visuals.

Checkpoint acceptance criteria:

- Real camera models load from the backend.
- Selecting a camera updates its image, specifications, focal range, and calculated results.
- Controls remain usable for fixed and varifocal models.
- The left column matches the approved layout and does not overflow at expected screen heights.

## 6. Implement the right-side projections

Implement both diagrams as responsive SVG views that consume the same real-world calculation model.

### Shared projection framework

Create a shared `ProjectionPanel` that supplies:

- Responsive width and height
- Plot margins for labels and controls
- Metre-to-pixel linear scales
- SVG clipping region
- Grid and axes
- Zoom/pan transform
- Zoom out, zoom in, reset/Fit, and fullscreen controls
- Consistent colors, strokes, dash patterns, labels, and marker definitions

The SVG should use `role="img"` with an accessible title/description. Toolbar buttons need visible focus styles and accessible names.

### Domain and Fit behavior

- Calculate domains from camera height, target distance, dead-zone distance, FOV width/height, and required annotation margins.
- Include the camera origin and target plane in the default Fit view.
- Generate readable tick intervals from the domain rather than hard-coding the mockup's labels.
- Keep top and side horizontal scales synchronized by default so the target distance aligns vertically across panels.
- Allow the panels to zoom independently after initial Fit if that produces the clearest interaction.
- Reset or recompute Fit when the selected model or installation geometry changes.

### Top-view projection

Render:

- Camera marker at `(0, 0)`.
- FOV polygon from the camera to `±w_target / 2` at the target distance.
- Solid upper and lower horizontal-FOV boundary rays.
- Dashed optical centerline.
- Horizontal FOV angle arc and degree label.
- Orange target plane at the selected target distance.
- Scene-width dimension arrow and label.
- Horizontal and vertical metre axes and aligned grid.

The projection should use calculation values; sample values from the mockup must not be hard-coded.

### Side-view projection

Use the project's existing positive-downward angle convention:

```text
bottom ray angle = top_ray_angle + v_angle
center ray angle = tilt_angle
ray height at distance d = camera height - d × tan(ray angle)
```

Render:

- Camera/wall marker at `(0, camera height)`.
- Horizontal mounting reference line.
- Solid top and bottom vertical-FOV rays.
- Dashed optical centerline.
- Tilt angle arc and label between the horizontal reference and centerline.
- Vertical FOV angle arc and label.
- Ground baseline.
- Dead-zone dimension from the camera ground projection to `d_near`.
- Orange target plane and target-distance marker.
- Mounting-height and target scene-height dimension markers.
- Horizontal and vertical metre axes and aligned grid.

Handle valid, capped-far-distance, partial-target, and invalid-both-rays-up statuses deliberately. Invalid geometry should show an explanatory message instead of malformed SVG coordinates.

### Projection polish

- Use the existing theme tokens rather than fixed light-mode colors.
- Keep labels legible during zoom; avoid allowing annotation text to become excessively small.
- Use `vector-effect="non-scaling-stroke"` where appropriate so important rays and dimensions remain visually consistent.
- Keep target, FOV, reference, and measurement colors semantically consistent with the existing CCTV theme.
- Prevent labels from covering the camera or leaving the visible plot where practical.
- Ensure all geometry updates immediately when inputs or camera models change.

Completion checks:

- The two projections and the results table use one calculation result and do not drift apart.
- Both views remain sharp on high-density displays.
- Zoom, pan, fullscreen, and Fit work without losing the current calculation state.
- Switching models or inputs does not leave stale projection geometry.

## 7. Manual testing and final review

No new automated tests are planned for this feature. Perform the following manual scenarios in the live application.

### Route and page shell

- Open the route from the dashboard.
- Refresh the route directly.
- Confirm protected-route behavior while signed out.
- Check the desktop two-column layout and narrow-screen stacked layout.
- Check every available theme.

### Camera selection

- Load the page while the backend is available.
- Verify loading, request-error, no-bullet-camera, and image-error states.
- Select cameras from multiple manufacturers.
- Select fixed-focal and varifocal bullet cameras.
- Confirm camera details and result values change with the selected model.

### Configuration controls

- Adjust all sliders with mouse and keyboard.
- Enter values directly into numeric inputs.
- Try minimum, maximum, empty, decimal, and out-of-range values.
- Confirm units, clamping, and disabled fixed-focal behavior.

### Projection correctness

- Confirm wider focal settings make the top-view FOV wider and tele settings make it narrower.
- Confirm increasing target distance moves the target plane and changes scene dimensions.
- Confirm mounting/target height changes affect tilt, rays, dead zone, and result values consistently.
- Compare displayed H-FOV, V-FOV, tilt, dead zone, width, and height against the calculation result shown in the UI/debug inspection.
- Exercise capped far distance, partial target, and invalid upward-ray states.
- Confirm axis tick labels use metres and angle labels use degrees.

### Projection interaction

- Exercise zoom in, zoom out, pointer/wheel zoom, pan, Fit, reset, and fullscreen.
- Resize the browser while zoomed and after returning to Fit.
- Confirm both panels preserve readable axes and labels.
- Confirm control buttons are keyboard accessible and display focus indication.

### Final validation

- Run the existing frontend lint and production build as static validation; these do not replace the manual UI test pass.
- Perform a final live-app walkthrough with the user.
- Record any accepted visual deviations or deferred improvements before marking the feature complete.

## Definition of done

- The new protected route is accessible from the application UI.
- Real bullet-camera models and their images load through the existing backend integration.
- Configuration controls produce consistent calculation results.
- The results table includes horizontal FOV, vertical FOV, scene width, scene height, and dead zone.
- Responsive top and side SVG projections display the camera, FOV, centerlines, target, axes, distances, angles, and dead-zone marker.
- The two requested live-review checkpoints have been completed and their feedback applied.
- The manual test checklist has been completed successfully.

## Out of scope

- Replacing or deleting the existing 3D visualiser without separate approval.
- Persisting visualiser settings to a project or backend record.
- Dragging the camera or target directly in the projection.
- PDF/CAD export.
- Adding a new backend API.
- Adding automated frontend projection tests or introducing another test runner.
