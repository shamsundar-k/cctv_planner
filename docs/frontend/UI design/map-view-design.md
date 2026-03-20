# Project Map View — UI Design Spec

**Section:** CCTV Survey Planner  
**Version:** 0.1  
**Status:** Design — In Progress

---

## 1. Overview

The project map view is the primary working screen of the application. Users arrive here by clciking open project button of the project card in the dashboard. It is the full application shell — navbar, left sidebar, map canvas, bottom toolbar, and an optional right edit panel that appears when a camera is selected.

---

## 2. Top-Level Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVBAR                               │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  LEFT        │           MAP CANVAS                        │
│  SIDEBAR     │                                              │
│  (collapsible│   [Floating: Compass, Fit All, Coords]      │
│              │                                              │
│              │                          ┌────────────────┐ │
│              │                          │  RIGHT EDIT    │ │
│              │                          │  PANEL         │ │
│              │                          │  (camera sel.) │ │
│              │                          └────────────────┘ │
├──────────────┴──────────────────────────────────────────────┤
│                     BOTTOM TOOLBAR                          │
└─────────────────────────────────────────────────────────────┘
```

| Region | Visibility | Behaviour |
|---|---|---|
| Navbar | Always visible | Fixed top |
| Left sidebar | Default visible | Collapsible — user can hide |
| Map canvas | Always visible | Fills remaining space |
| Right edit panel | Hidden by default | Appears when a camera is selected, hidden when deselected |
| Bottom toolbar | Always visible | Fixed bottom |

---

## 3. Navbar

### Elements (left → right)

| Element | Position | Notes |
|---|---|---|
| App logo | Far left | Non-interactive, branding only |
| Project name | Left, after logo | Editable inline — click to edit, blur to save |
| Save button + last saved timestamp | Centre-right | Manual save trigger; timestamp updates on auto-save |
| User avatar / account menu | Far right | Dropdown: profile,exit project, logout |

### Behaviours
- **Inline project name editing:** clicking the name turns it into a text input; pressing Enter or blurring commits the change and calls `PUT /projects/{id}`
- **Save button:** triggers manual save; shows a spinner during save; timestamp format e.g. *"Saved 2 min ago"*
- **Unsaved changes indicator:** a subtle dot or asterisk on the Save button when local state differs from last saved state

---

## 4. Left Sidebar

### Behaviour
- Default state: visible, fixed width (~236px)
- Collapsible via a toggle button on the sidebar edge
- When collapsed: shrinks to an icon rail (~44px), tab icons remain visible

### Tabs

| Tab | Contents |
|---|---|
| Cameras | List of all camera instances in the project |
| Layers | Global visibility toggles for FOV layers, zones, base map style |
| Select camera model | select camera model imported in the project. When user goes to add camera on map this selected model will be used to place camera on map  |

### Cameras Tab
- Lists all placed cameras by label (e.g. CAM-01, CAM-02)
- Each row: colour dot · camera label · model name · visibility toggle icon
- Clicking a row selects the camera → right edit panel opens
- Selected camera row is highlighted
- Empty state: *"No cameras placed yet. Use the toolbar to place a camera."*

### Layers Tab
- Toggle: Show / hide all FOV polygons (global)
- Toggle: Show / hide all zone polygons
- Toggle: Show / hide camera labels on map
- Base map style selector (if multiple tile styles supported)



---

## 5. Map Canvas

### Description
The map canvas fills all space not occupied by the navbar, sidebar, and toolbar. It renders the Leaflet.js map with Stadia Maps tiles, camera icons, FOV polygons, and zone overlays.

### Floating Controls

| Control | Position | Behaviour |
|---|---|---|
| Compass / north indicator | Top-right | Static north indicator; rotates if map is rotated |
| Fit all cameras button | Top-right, below compass | Flies map to bounding box of all placed cameras |
| Coordinates display | Bottom-left | Shows lat/lng of current mouse position on map |

### Map Layers (z-order, bottom to top)
1. Base map tiles (Stadia Maps)
2. Zone polygons (coverage areas, perimeters, exclusions)
3. FOV polygons (semi-transparent, per-camera colour)
4. DORI sub-zone overlays (dashed rings within active FOV)
5. Camera icons (directional SVG markers)
6. Camera labels

### Camera Icon Behaviour
- Directional SVG icon rotated to camera bearing
- Selected camera: highlighted ring around icon
- Draggable — drag to reposition; FOV updates on drag end (debounced 300ms → PUT)
- Right-click or single click → selects camera, opens right edit panel

---

## 6. Bottom Toolbar

Tools are grouped logically with separators.

```
[ Pan | Select ]  |  [ Place Camera | Draw Polygon | Draw Line ]  |  [ Measure ]  |  [ Delete ]
```

| Tool | Behaviour |
|---|---|
| Pan | Default map pan/drag mode |
| Select | Click a camera or zone to select it |
| Place Camera | Next map click places a camera; model is selected from the left sidebar |
| Draw Polygon | Activates Leaflet.draw polygon mode |
| Draw Line | Activates Leaflet.draw polyline mode |
| Measure | Click two points to measure distance in metres |
| Delete | Click a camera or zone to delete it (confirms before deleting) |

### Toolbar Rules
- Only one tool active at a time; active tool is visually highlighted
- Pressing `Escape` returns to Select tool
- Delete tool shows a confirmation prompt before removing an element

---

## 7. Right Edit Panel

### Visibility
- Hidden entirely when no camera is selected
- Slides in from the right when a camera is selected
- Closes when the user clicks elsewhere on the map or presses `Escape`
- Fixed width (~280px), full height (below navbar, above toolbar)

### Panel Header
- Camera label (e.g. CAM-01) — editable inline
- Camera model name — read-only subtitle
- Close (×) button

### Tabs

The panel is organised into two tabs:

#### Tab 1 — Basic

| Section | Fields |
|---|---|
| **Placement** | Position (lat/lng, read-only, updated by drag); Move camera button (re-activates drag mode) |
| **Orientation** | Bearing compass widget (draggable dial + numeric input) |
| **FOV** | Focal length slider (drives H-FOV angle automatically); Installation height (metres); FOV colour picker; FOV visibility toggle |

**Focal length slider behaviour:**
- Slider range matches the selected camera model's `f_min` → `f_max`
- Moving the slider recomputes `H_angle` and `V_angle` using the interpolation formula from the DORI spec
- Recomputed FOV polygon is sent to backend (debounced PUT) and re-rendered on map

#### Tab 2 — DORI

All values are **read-only computed results**, recalculated whenever focal length, installation height, bearing, or position changes.

| Field | Description |
|---|---|
| Installation height | Input (editable here too, mirrors Basic tab) |
| Target distance | Horizontal distance to the far edge of coverage (D_far) in metres |
| Target height | Height of target above ground (default 1.8m, editable) |
| **DORI Results** | |
| Identification distance | D_horiz at ≥ 250 PPM |
| Recognition distance | D_horiz at ≥ 125 PPM |
| Observation distance | D_horiz at ≥ 62 PPM |
| Detection distance | D_horiz at ≥ 25 PPM |
| PPM at near edge | Pixel density at D_near |
| PPM at far edge | Pixel density at D_far |
| Total coverage area | Trapezoidal footprint in m² |

DORI distances are displayed as inline read-only values with a colour-coded label per level (Identification → red, Recognition → orange, Observation → yellow, Detection → green).

A note is shown if any DORI distance exceeds D_far: *"Detection range extends beyond geometric coverage. Installation geometry is the limiting factor."*

### Panel Footer
- **Delete button** — removes camera from project (with confirmation)

---

## 8. Component Tree

```
<ProjectMapView>

  <Navbar>
    <AppLogo />
    <ProjectNameInput />               ← inline editable
    <SaveButton lastSaved={...} />
    <UserMenu />
  </Navbar>

  <WorkspaceRow>

    <LeftSidebar collapsed={bool}>
      <SidebarToggle />
      <SidebarTabs>
        <CamerasTab>
          <CameraListItem                ← repeated per camera
            selected={bool}
            onSelect={() => ...}
          />
          <EmptyState />
        </CamerasTab>
        <LayersTab>
          <LayerToggle label="FOV Polygons" />
          <LayerToggle label="Zones" />
          <LayerToggle label="Camera Labels" />
          <BasemapSelector />
        </LayersTab>
        <ModelsTab>
          <ModelListItem />              ← repeated per model
          <AddModelButton />
          <EmptyState />
        </ModelsTab>
      </SidebarTabs>
    </LeftSidebar>

    <MapCanvas>
      <LeafletMap>
        <ZoneLayer />
        <FOVLayer />                     ← one polygon per camera
        <DORIOverlayLayer />             ← dashed rings on selected camera
        <CameraIconLayer />              ← draggable icons
        <CameraLabelLayer />
      </LeafletMap>
      <CompassIndicator />               ← floating, top-right
      <FitAllButton />                   ← floating, top-right
      <CoordinatesDisplay />             ← floating, bottom-left
    </MapCanvas>

    <RightEditPanel visible={cameraSelected}>
      <PanelHeader>
        <CameraLabelInput />
        <CameraModelSubtitle />
        <CloseButton />
      </PanelHeader>
      <PanelTabs>
        <BasicTab>
          <PlacementSection>
            <PositionDisplay />
            <MoveCameraButton />
          </PlacementSection>
          <OrientationSection>
            <BearingCompass />
          </OrientationSection>
          <FOVSection>
            <FocalLengthSlider />        ← drives H/V angle
            <InstallationHeightInput />
            <ColourPicker />
            <VisibilityToggle />
          </FOVSection>
        </BasicTab>
        <DORITab>
          <InstallationHeightInput />    ← mirrored from Basic tab
          <TargetDistanceInput />
          <TargetHeightInput />
          <DORIResultsDisplay />         ← read-only computed values
          <DORILimitingFactorNote />     ← conditional warning
        </DORITab>
      </PanelTabs>
      <PanelFooter>
        <DeleteButton />
      </PanelFooter>
    </RightEditPanel>

  </WorkspaceRow>

  <BottomToolbar>
    <ToolGroup>
      <ToolButton tool="pan" />
      <ToolButton tool="select" />
    </ToolGroup>
    <ToolSeparator />
    <ToolGroup>
      <ToolButton tool="placeCamera" />
      <ToolButton tool="drawPolygon" />
      <ToolButton tool="drawLine" />
    </ToolGroup>
    <ToolSeparator />
    <ToolButton tool="measure" />
    <ToolSpacer />
    <ToolButton tool="delete" variant="danger" />
  </BottomToolbar>

  <SuccessToast />                       ← shown on first load after wizard

</ProjectMapView>
```

---



## 09. Out of Scope (Deferred)

| Feature | Notes |
|---|---|
| Collaborator avatars in navbar | Deferred — WebSocket presence indicators in a later design pass |
| Report & KML export buttons in navbar | Deferred — export flow designed separately |
| Zone edit panel | Deferred — designed separately after camera edit panel |
| Undo / Redo in toolbar | Not included in v1 |
| Coverage stats bar on map | Deferred — part of coverage analysis feature design |
| Floor plan base layer | Deferred to v2 |
