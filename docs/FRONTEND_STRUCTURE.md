# Frontend Package — Project Structure

> **Package:** `packages/frontend`  
> **Framework:** React + Vite + TypeScript

---

## `src/`

```
src/
├── main.tsx                         -- App entry point; mounts React root and registers Axios interceptors
├── index.css                        -- Global styles, CSS custom properties, and Tailwind base layer
├── queryClient.ts                   -- Shared TanStack Query client instance
├── vite-env.d.ts                    -- Vite env type declarations and virtual module stubs
│
├── api/
│   ├── client.ts                    -- Shared Axios instance used by all API modules
│   ├── interceptors.ts              -- Axios request/response interceptors (auth token injection, error handling)
│   ├── camerasModels.ts             -- TanStack Query hooks for fetching the global camera-model catalogue
│   ├── projects.ts                  -- TanStack Query hooks for project CRUD and camera-model associations
│   └── projects.types.ts            -- TypeScript types for project API responses (Project, Collaborator, etc.)
│
├── components/
│   ├── AdminRoute.tsx               -- Route guard that restricts access to admin-only pages
│   ├── AppUserAvatar.tsx            -- User avatar displayed in the top navigation bar
│   ├── NavLogo.tsx                  -- Application logo shown in the navbar
│   ├── ProtectedRoute.tsx           -- Route guard that redirects unauthenticated users to /login
│   ├── PublicOnlyRoute.tsx          -- Route guard that redirects authenticated users away from public pages
│   ├── UserMenu.tsx                 -- Dropdown user menu with profile and logout actions
│   ├── BottomToolbar/
│   │   ├── BottomToolbar.tsx        -- Container for the map bottom toolbar with tool groups
│   │   ├── ToolButton.tsx           -- Single toggleable tool button within the toolbar
│   │   ├── ToolGroup.tsx            -- Groups related tool buttons with an optional divider
│   │   ├── toolbarConfig.ts         -- Static configuration declaring all tools and their groups
│   │   └── toolIcons.tsx            -- Icon components used by toolbar tool buttons
│   └── ui/
│       ├── CollapsibleSection.tsx   -- Expandable/collapsible panel section with animated toggle
│       ├── FormField.tsx            -- Labelled wrapper around a form input with optional error display
│       ├── InputWithUnit.tsx        -- Number input with an inline unit label (e.g. "mm", "°")
│       ├── SelectField.tsx          -- Styled native select element with label and error support
│       ├── Toast.tsx                -- Auto-dismissing notification toast component
│       ├── ToggleSwitch.tsx         -- Accessible boolean toggle switch input
│       └── Tooltip.tsx              -- Hover tooltip wrapper rendered via a portal
│
├── config/
│   ├── mapConfig.ts                 -- Base map tile URL definitions and default map settings
│   └── themes.ts                   -- Design-token theme definitions injected as CSS custom properties
│
├── constants/
│   └── sensorFormats.ts             -- Lookup data for common camera sensor format sizes
│
├── context/
│   └── MapContext.ts                -- React context providing the Leaflet map instance to child components
│
├── hooks/
│   ├── useFieldSearch.ts            -- Generic hook for filtering a list of objects by a search string
│   └── useToolbarKeyboard.ts        -- Keyboard shortcut handler for activating map tools
│
├── lib/
│   ├── cameraGenerator.ts           -- Utility that creates new CameraInstance objects with default values
│   ├── fovCalculations.ts           -- Math helpers for computing camera field-of-view polygon coordinates
│   └── fovCalculations.test.ts      -- Unit tests for fovCalculations helpers
│
├── types/
│   ├── camera.types.ts              -- Core Camera and CameraInstance TypeScript interfaces
│   └── cameramodel.types.ts         -- CameraModel interface and related enums (CameraType, LensType, etc.)
│
├── utils/
│   └── jwt.ts                       -- Lightweight JWT decoder for reading claims (no signature verification)
│
├── store/
│   ├── authSlice.ts                 -- Zustand auth store with localStorage persistence for JWT and user info
│   ├── baseTileStore.ts             -- Zustand store tracking the active base-map tile layer
│   ├── cameraLayerSlice.ts          -- Zustand store for selected/hidden camera IDs in the map layer
│   ├── layerVisibilityStore.ts      -- Zustand store controlling per-layer visibility toggles (cameras, draw)
│   ├── mapActionsSlice.ts           -- Zustand store for the currently active map tool (pan, select, place-camera, etc.)
│   ├── projectSlice.ts              -- Zustand store for project list UI state (filter, sort, search)
│   ├── selectedCameraModelSlice.ts  -- Zustand store for the camera model currently selected in the selector panel
│   └── cameraStore/
│       ├── index.ts                 -- Re-exports for the camera store and its TypeScript types
│       ├── store.ts                 -- Zustand camera store; manages camera CRUD with optimistic updates
│       ├── types.ts                 -- Types for camera save status, tracking entries, and store state
│       ├── helpers.ts               -- Pure functions for filtering cameras and applying tracking patches
│       └── payloadBuilders.ts       -- Builders that transform Camera objects into API create/update payloads
│
├── pages/
│   ├── LoginPage.tsx                -- Login page rendered at /login for unauthenticated users
│   ├── DashboardPage.tsx            -- Main project dashboard at /; lists, filters, and manages projects
│   ├── AdminPage.tsx                -- Admin area entry page at /admin/manage; guards non-admin users
│   ├── AdminCamerasPage.tsx         -- Admin page listing all camera models in the catalogue
│   ├── AdminCameraCreatePage.tsx    -- Admin page with a form to create a new camera model
│   ├── AdminCameraEditPage.tsx      -- Admin page with a form to edit an existing camera model
│   ├── AcceptInvitePage.tsx         -- Page for accepting a project collaboration invite via token
│   ├── ProjectManagePage.tsx        -- Project settings page at /project/manage/:id with tabbed editor
│   └── ProjectMapView/
│       ├── index.tsx                -- Root map view page assembling the map, sidebar, toolbar, and overlays
│       ├── LeftSidebar.tsx          -- Tabbed left sidebar toggling between camera models and placed cameras
│       ├── CamerasTab.tsx           -- Sidebar tab listing cameras placed on the current project map
│       └── ModelSelectorTab.tsx     -- Sidebar tab for browsing and selecting camera models to place
│
└── features/
    │
    ├── accept-invite/
    │   ├── api/
    │   │   ├── acceptInvite.ts          -- API call to redeem a project invite token
    │   │   └── acceptInvite.types.ts    -- Types for the accept-invite request/response
    │   ├── component/
    │   │   ├── AcceptInviteForm.tsx     -- Form that submits the invite token to join a project
    │   │   ├── AcceptInvitePanel.tsx    -- Card panel wrapping the invite form and status message
    │   │   └── InviteStatusMessage.tsx  -- Success/error message shown after invite redemption
    │   └── hooks/
    │       └── useAcceptInvite.ts       -- Hook managing invite redemption mutation and state
    │
    ├── admin/
    │   ├── api/
    │   │   ├── admin.ts                 -- API functions for fetching admin stats, users, and projects
    │   │   └── admin.types.ts           -- Types for admin API responses (AdminStats, AdminUser, etc.)
    │   ├── component/
    │   │   ├── AdminDashboard.tsx       -- Top-level admin dashboard layout with header, stats, and tabs
    │   │   ├── AdminHeader.tsx          -- Page header section for the admin dashboard
    │   │   ├── AdminStatCards.tsx       -- Row of stat cards showing user/project/camera counts
    │   │   ├── AdminTabNav.tsx          -- Tab navigation bar for switching admin sections
    │   │   ├── DeleteModal.tsx          -- Confirmation modal for destructive admin delete actions
    │   │   ├── OverviewTab.tsx          -- Admin overview tab showing summary stats and recent activity
    │   │   ├── ProjectsTab.tsx          -- Admin tab listing all projects with management actions
    │   │   ├── SearchInput.tsx          -- Debounced search input used across admin tables
    │   │   ├── Spinner.tsx              -- Loading spinner shown while admin data is fetching
    │   │   ├── StatCard.tsx             -- Single stat card displaying a metric with icon and label
    │   │   ├── types.ts                 -- Shared TypeScript types for admin UI components
    │   │   ├── UsersTab.tsx             -- Admin tab listing all users with role and delete controls
    │   │   └── utils.ts                 -- Admin UI helper functions (date formatting, role display, etc.)
    │   └── hooks/
    │       ├── useAdminActions.ts       -- Hook encapsulating admin delete mutations for users and projects
    │       └── useAdminData.ts          -- Hook that fetches and composes admin stats, users, and projects
    │
    ├── camera-model/
    │   ├── components/
    │   │   ├── CameraGrid.tsx           -- Responsive grid displaying the list of camera model cards
    │   │   ├── CameraListHeader.tsx     -- Header bar for the camera model list with title and add button
    │   │   ├── CameraSearchBar.tsx      -- Search input that filters the camera model grid by name/manufacturer
    │   │   ├── CameraCard/
    │   │   │   ├── CameraCard.tsx       -- Top-level card component representing a single camera model
    │   │   │   ├── CameraCardActions.tsx -- Edit/delete action buttons shown on a camera card
    │   │   │   ├── CameraCardHeader.tsx  -- Card header showing camera name, type badge, and manufacturer
    │   │   │   └── CameraCardSpec.tsx    -- Card section displaying key specs (focal length, sensor, FOV)
    │   │   └── CameraForm/
    │   │       ├── CameraCreateForm.tsx  -- Form page for creating a new camera model
    │   │       ├── CameraEditForm.tsx    -- Form page for editing an existing camera model
    │   │       ├── AdvancedSection.tsx   -- Collapsible form section for advanced camera parameters
    │   │       ├── DeleteConfirmModal.tsx -- Confirmation modal before deleting a camera model
    │   │       ├── FormActions.tsx       -- Form submit/cancel/delete action button row
    │   │       ├── IdentitySection.tsx   -- Form section for camera name, manufacturer, and type fields
    │   │       ├── LensSection.tsx       -- Form section for focal length and lens type fields
    │   │       ├── SensorSection.tsx     -- Form section for sensor size and resolution fields
    │   │       ├── cameraFormHelpers.ts  -- Helpers to build default form values and map to API payload
    │   │       └── formStyles.ts         -- Shared CSS class strings for consistent camera form styling
    │   └── hooks/
    │       ├── useAdminCameraCreate.ts   -- Hook managing the camera model creation form submit flow
    │       ├── useAdminCameraEdit.ts     -- Hook managing the camera model edit form submit flow
    │       ├── useCameraFormState.ts     -- Hook encapsulating all react-hook-form state for camera forms
    │       ├── useCameraModelDelete.ts   -- Hook handling camera model deletion with confirmation state
    │       └── useCameraModelList.ts     -- Hook fetching and exposing the full camera model catalogue list
    │
    ├── camera-selector/
    │   └── component/
    │       ├── ModelSelectorPanel.tsx    -- Full panel for browsing and selecting a camera model to place
    │       ├── CameraBrief.tsx           -- Compact summary card shown for the currently selected model
    │       ├── ManufacturerFilter.tsx    -- Dropdown filter for narrowing camera list by manufacturer
    │       ├── ModelDropdown.tsx         -- Searchable dropdown listing camera models for a manufacturer
    │       ├── PanelHeader.tsx           -- Header bar of the model selector panel with title and close button
    │       └── SelectCameraModel.tsx     -- Trigger button that opens the model selector panel
    │
    ├── dashboard/
    │   ├── components/
    │   │   ├── DashboardErrorBanner.tsx  -- Error banner displayed when the project list fails to load
    │   │   ├── EmptyState.tsx            -- Illustration and CTA shown when the user has no projects
    │   │   ├── ProjectList.tsx           -- Renders the grid of project cards
    │   │   └── ProjectToolbar.tsx        -- Search, sort, and filter toolbar above the project list
    │   └── hooks/
    │       └── useDashboard.ts           -- Hook orchestrating project list fetch, search, sort, and create/delete
    │
    ├── invites/
    │   ├── api/
    │   │   ├── invites.ts               -- API functions for generating and listing project invite links
    │   │   └── invites.types.ts         -- Types for invite API requests and responses
    │   ├── component/
    │   │   ├── InviteGenerateCard.tsx    -- Card UI for generating a new invite link with role selection
    │   │   ├── InvitesTab.tsx            -- Admin project settings tab for managing invites
    │   │   └── utils.ts                  -- Invite helper functions (link construction, expiry formatting)
    │   └── hooks/
    │       └── useInvites.ts             -- Hook managing invite generation mutation and list query
    │
    ├── login/
    │   ├── api/
    │   │   └── api.ts                   -- API call for submitting login credentials and receiving JWT tokens
    │   └── component/
    │       ├── LoginCard.tsx             -- Container card composing all login page sub-components
    │       ├── LoginForm.tsx             -- Controlled login form with email and password fields
    │       ├── FormField.tsx             -- Local labelled input field used within the login form
    │       ├── LoginBackgroundOrbs.tsx   -- Decorative animated gradient orbs on the login page background
    │       ├── LoginErrorBanner.tsx      -- Error message banner shown on failed login attempts
    │       ├── LoginLogo.tsx             -- Application logo rendered at the top of the login card
    │       ├── LoginPageFooter.tsx       -- Footer section at the bottom of the login page
    │       └── LoginSubmitButton.tsx     -- Submit button for the login form with loading state
    │
    ├── map-view/
    │   ├── components/
    │   │   ├── CameraMarker.tsx          -- Leaflet marker component rendering a camera icon on the map
    │   │   ├── layers/
    │   │   │   ├── CameraLayer.tsx       -- Renders all placed camera markers onto the map
    │   │   │   └── DrawLayer.tsx         -- Renders user-drawn shapes (polygons, lines) onto the map
    │   │   ├── map/
    │   │   │   ├── Map.tsx               -- Base Leaflet map container that provides the MapContext
    │   │   │   ├── BaseTile.tsx          -- Renders the active base-map tile layer inside the Leaflet map
    │   │   │   ├── FovLayer.tsx          -- Layer component that renders FOV polygons for all cameras
    │   │   │   ├── FovPolygon.tsx        -- Single Leaflet polygon representing one camera's field of view
    │   │   │   ├── CameraPropertiesPanel.tsx -- Slide-in panel showing editable properties for a selected camera
    │   │   │   └── MapModeOverlay.tsx    -- Switches between interaction overlays based on the active tool
    │   │   ├── map-actions/
    │   │   │   ├── index.ts              -- Re-exports for the map actions toolbar components
    │   │   │   ├── MapActionsToolbar.tsx -- Vertical toolbar with buttons for each available map tool
    │   │   │   └── MapActionButton.tsx   -- Single icon button within the map actions toolbar
    │   │   ├── MapNavbar/
    │   │   │   ├── MapNavbar.tsx         -- Top navigation bar for the map view with project title and actions
    │   │   │   ├── ProjectTitle.tsx      -- Displays and allows inline editing of the project name in the navbar
    │   │   │   └── SaveButton.tsx        -- Save button in the map navbar that triggers a project save
    │   │   ├── overlays/
    │   │   │   ├── index.ts              -- Re-exports for all map mode overlay components
    │   │   │   ├── DefaultOverlay.tsx    -- Overlay for the default pan/select mode (no special interaction)
    │   │   │   ├── PlaceCameraOverlay.tsx -- Overlay that handles click-to-place camera on the map
    │   │   │   ├── DrawLineOverlay.tsx   -- Overlay that captures click points to draw a line on the map
    │   │   │   └── DrawPolygonOverlay.tsx -- Overlay that captures click points to draw a polygon on the map
    │   │   └── toolbar/
    │   │       ├── MapLayersControl.tsx  -- Control panel for toggling map layer visibility
    │   │       ├── LayersPanel.tsx       -- Panel listing individual layer toggles
    │   │       ├── BasemapPanel.tsx      -- Panel for switching the active base-map tile style
    │   │       └── ToolbarButton.tsx     -- Generic icon button used in the map toolbar panels
    │   └── hooks/
    │       ├── useMapView.ts             -- Hook initialising map view state; loads project cameras on mount
    │       └── useSaveAction.ts          -- Hook wiring the save button to the camera store persist action
    │
    ├── navigation/
    │   ├── component/
    │   │   ├── Navbar.tsx                -- Top application navbar with logo, search, and user menu
    │   │   ├── NavActions.tsx            -- Right-side action buttons (notifications, admin link) in the navbar
    │   │   └── NavSearchBar.tsx          -- Inline search bar in the navbar for project quick-search
    │   └── hooks/
    │       ├── useNavbarSearch.ts        -- Hook managing navbar search input state and navigation
    │       └── useUserMenu.ts            -- Hook controlling the open/close state of the user dropdown menu
    │
    ├── project-manage/
    │   ├── components/
    │   │   ├── BasicInfoTab.tsx          -- Settings tab for editing project name, description, and visibility
    │   │   ├── ImportedCamerasTab.tsx    -- Settings tab listing camera models imported into the project
    │   │   └── MapLocationTab.tsx        -- Settings tab for setting the project's default map center and zoom
    │   └── hooks/
    │       └── useProjectManage.ts       -- Hook fetching project data and mutations for project settings tabs
    │
    └── projects/
        ├── components/
        │   ├── ProjectCard.tsx           -- Full project card combining header, description, meta, and actions
        │   ├── ProjectCardHeader.tsx     -- Card header showing project name and type icon
        │   ├── ProjectCardDescription.tsx -- Truncated project description shown on the card body
        │   ├── ProjectCardMeta.tsx       -- Meta info row showing camera count and collaborator count
        │   ├── ProjectCardTimestamps.tsx -- Created/updated timestamps displayed at the bottom of the card
        │   ├── ProjectCardActions.tsx    -- Primary action buttons (open map, manage) on the project card
        │   ├── ProjectCardMenu.tsx       -- Overflow dropdown menu with secondary actions (delete, share)
        │   ├── CreateProjectModal.tsx    -- Modal dialog with a form for creating a new project
        │   └── DeleteProjectModal.tsx    -- Confirmation modal for deleting a project
        └── utils/
            └── projectCardFormat.ts     -- Formatting helpers for dates and counts displayed on project cards
```
