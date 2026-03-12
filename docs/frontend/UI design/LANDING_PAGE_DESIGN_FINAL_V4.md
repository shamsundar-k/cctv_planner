# CCTV Survey Planner — Post-Login Landing Page Design Plan
## Desktop-Only Web Application (Admin & Regular User, Simplified)

**Version:** 4.0  
**Date:** March 2026  
**Status:** Final Desktop-Optimized Specification  
**Scope:** Pure desktop web application (≥1024px viewport minimum)

---

## Table of Contents

1. [Overview & Purpose](#overview--purpose)
2. [Design Philosophy](#design-philosophy)
3. [User Types & Permissions](#user-types--permissions)
4. [Page Layout & Grid](#page-layout--grid)
5. [Navbar Component](#navbar-component)
6. [Projects List Section](#projects-list-section)
7. [Project Card Details](#project-card-details)
8. [Toolbar & Controls](#toolbar--controls)
9. [Modals & Dialogs](#modals--dialogs)
10. [Data & State Management](#data--state-management)
11. [Visual Design System](#visual-design-system)
12. [Interaction Patterns](#interaction-patterns)
13. [Performance & Optimization](#performance--optimization)
14. [Implementation Roadmap](#implementation-roadmap)
15. [Accessibility Standards](#accessibility-standards)

---

## 1. Overview & Purpose

### What is the Landing Page?

The **landing page** (Dashboard) is the first page a user sees after successful login. It serves as the central hub for CCTV survey project management — allowing users to view, create, edit, and delete their own projects.

### Key Objectives

- **Quick project access:** View all projects at once with comprehensive metadata
- **Efficient project discovery:** Search, filter, and sort all projects in a single view
- **One-click actions:** Open, edit, or delete projects without friction
- **Project overview:** Understand project scope at a glance (camera count, zone count, creation date)
- **Professional presentation:** Clean, enterprise-grade UI suitable for desktop environments

### User Personas

| Persona | Type | Behavior | Dashboard Needs |
|---|---|---|---|
| **System Administrator** | Admin | Manages user accounts, views all projects in the system, creates/edits/deletes projects | Access to user management, see all projects |
| **User** | Regular User | Creates and manages own projects, generates reports | Quick access to own projects, create new projects |


**Key difference:** Admin users see a "Users" link in the user menu for account management. Regular users only see their own projects.

---

## 2. Design Philosophy

### Desktop-First Approach

This is a **desktop web application**, not a responsive design. Every pixel is optimized for desktop monitors (minimum 1024px width, typical 1920px or wider).

**Principles:**

1. **Generous spacing:** Desktop has unlimited horizontal real estate — use it liberally
2. **Large, readable text:** 14px+ body text; 32px+ headings
3. **Rich data visualization:** Project cards show comprehensive metadata
4. **Multi-column layouts:** 2–4 columns depending on viewport width
5. **No hamburger menus:** All navigation is always visible
6. **Keyboard-centric:** Tab order, keyboard shortcuts, focus states are first-class
7. **No touch optimization:** Desktop mouse + keyboard only
8. **Simple, focused interactions:** Straightforward project CRUD workflows

### Key Constraint

**No pagination needed:** All projects loaded in single request. Expected project count is low (<100 per user).

---

## 3. User Types & Permissions

### Admin User

**Capabilities:**
- View all projects in the system (not just own)
- Create, edit, delete own projects
- Invite new users (generate invite links)
- Manage user accounts (disable, delete users)
- Access system settings

**Dashboard UI differences:**
- Page title: "All Projects" (Admin view shows all projects)
- Additional "Manage Users" link in user menu
- Can access `/admin/users` page for user management
- Filter available: All / Only Mine / Archived

### Regular User

**Capabilities:**
- Create, edit, delete own projects
- Search and filter own projects
- Generate reports and export KML

**Dashboard UI differences:**
- Page title: "My Projects" (only own projects visible)
- No admin menu items
- Filter available: All / Archived (only own projects)
- Clean, focused dashboard

---

## 4. Page Layout & Grid

### 4.1 Full-Page Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  NAVBAR (height: 64px, sticky)                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ▣ CCTV Survey Planner   [Search: Open projects...]  🔔  👤 ▼  ❓     │  │
│  │                         (Press Ctrl+K)                                 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│  MAIN CONTENT (max-width: 1600px, centered, padding: 40px)                  │
│                                                                               │
│  Page Header:                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  My Projects (or "All Projects" for Admin)                             │  │
│  │                                                                         │  │
│  │  [+ Create Project]  [Search] [Filter ▼] [Sort: Last Modified ▼] [⟳] │  │
│  │                                                                         │  │
│  │  12 projects | Updated 2 minutes ago                                  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  Project Grid (4 columns @ 1920px, 3 @ 1600px, 2 @ 1024px):                │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐    │
│  │  PROJECT CARD 1      │ │  PROJECT CARD 2      │ │ PROJECT CARD 3  │    │
│  │  (450px width)       │ │  (450px width)       │ │ (450px)         │    │
│  │                      │ │                      │ │                 │    │
│  │  [Title]             │ │  [Title]             │ │ [Title]         │    │
│  │  [Metadata]          │ │  [Metadata]          │ │ [Metadata]      │    │
│  │  [Description]       │ │  [Description]       │ │ [Description]   │    │
│  │  [Timestamp]         │ │  [Timestamp]         │ │ [Timestamp]     │    │
│  │  [Action buttons]    │ │  [Action buttons]    │ │ [Actions]       │    │
│  │                      │ │                      │ │                 │    │
│  └──────────────────────┘ └──────────────────────┘ └─────────────────┘    │
│                                                                               │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐    │
│  │  PROJECT CARD 4      │ │  PROJECT CARD 5      │ │ PROJECT CARD 6  │    │
│  │                      │ │                      │ │                 │    │
│  │  ...                 │ │  ...                 │ │  ...            │    │
│  │                      │ │                      │ │                 │    │
│  └──────────────────────┘ └──────────────────────┘ └─────────────────┘    │
│                                                                               │
│  (Empty state if no projects)                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🎯 No Projects Yet                                                    │  │
│  │  Create your first CCTV survey project to get started.                 │  │
│  │  [+ Create Project] [View Documentation]                              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Responsive Grid Strategy

**Breakpoints (desktop only):**

| Viewport Width | Grid Columns | Card Width | Gap |
|---|---|---|---|
| 1024px–1279px | 2 columns | 450px | 24px |
| 1280px–1599px | 2–3 columns | 450px | 32px |
| 1600px–1919px | 3 columns | 450px | 32px |
| 1920px–2559px | 4 columns | 450px | 32px |
| 2560px+ | 4 columns | 500px | 40px |

**Page margins:**
- Horizontal: 40px (1024–1920px), 60px (1920–2560px), 80px (2560px+)
- Vertical: 40px (top/bottom of content area)
- Max content width: 1600px

---

## 5. Navbar Component

### 5.1 Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo + Text]         [Search Bar]                 [Icons]         │
│  ▣ CCTV Survey      📥 Open projects...    🔔  👤 ▼  ❓             │
│  Planner            (Press Ctrl+K)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Components

**Logo Section (left):**
- Icon: Small CCTV symbol (24px)
- Text: "CCTV Survey Planner" (18px, bold)

**Global Search Bar (center):**
- Placeholder: "Open projects... (Press Ctrl+K to focus)"
- Width: 400px (fixed)
- Functionality: Type to filter projects by name (client-side, real-time)
- Keyboard shortcut: Ctrl+K (Cmd+K on Mac) to focus
- Esc to clear and unfocus

**Right Actions:**
- **Notifications bell** (🔔) — Greyed out (placeholder for future)
- **User avatar** (👤) — Click to open user menu dropdown
  - Shows: Name, email, separator, Profile, Settings
  - **Admin only:** "Manage Users" link
  - Logout
- **Help icon** (❓) — Links to documentation (external)

### 5.3 User Menu

**Regular User Menu:**
```
┌──────────────────────────┐
│ John Smith               │
│ john@example.com         │
│ ──────────────────────── │
│ My Profile               │
│ Settings                 │
│ Help & Documentation     │
│ ──────────────────────── │
│ Logout                   │
└──────────────────────────┘
```

**Admin User Menu:**
```
┌──────────────────────────┐
│ Admin User               │
│ admin@example.com        │
│ ──────────────────────── │
│ My Profile               │
│ Settings                 │
│ Manage Users             │ ← Admin only
│ Help & Documentation     │
│ ──────────────────────── │
│ Logout                   │
└──────────────────────────┘
```

### 5.4 Styling

```
Height: 64px
Background: White (#ffffff)
Border-bottom: 1px solid #e0e0e0
Position: sticky (remains visible on scroll)
Box-shadow: 0 2px 4px rgba(0,0,0,0.05)
Padding: 0 40px

Logo:
  Font-size: 18px
  Font-weight: 700
  Color: #1a1a1a
  Margin-right: 40px

Search bar:
  Width: 400px
  Padding: 8px 12px
  Border: 1px solid #d0d0d0
  Border-radius: 6px
  Font-size: 14px
  Background: #fafafa
  Focus: Border 2px solid #0066cc, background white

Icons (right):
  Gap: 24px between icons
  Font-size: 18px
  Color: #666666
  Cursor: pointer
  Hover: Color #0066cc
```

---

## 6. Projects List Section

### 6.1 Toolbar (Below Navbar)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│ My Projects (or "All Projects" for Admin)                         │
│                                                                    │
│ [+ Create Project]  [Search] [Filter ▼]  [Sort: Last Modified ▼] │
│                                                          [⟳]      │
│                                                                    │
│ 12 projects | Updated 2 minutes ago                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Elements:**

| Element | Type | Options | Default |
|---|---|---|---|
| **Page Title** | Text | "My Projects" (Regular) / "All Projects" (Admin) | Dynamic |
| **+ Create Project** | Button (Primary) | Click → Modal | — |
| **Search** | Input | Type to filter | Empty |
| **Filter** | Dropdown | Regular: All / Archived; Admin: All / Only Mine / Archived | All |
| **Sort** | Dropdown | Last Modified (↓) / Last Modified (↑) / Name (A–Z) / Name (Z–A) / Created (↓) / Created (↑) | Last Modified (↓) |
| **Refresh** | Button (Icon) | Click → Refetch projects | — |
| **Metadata line** | Text (read-only) | Shows count, last update | Dynamic |

### 6.2 Project Grid Layout

**Grid properties:**
- Display: CSS Grid
- Grid-template-columns: repeat(auto-fit, minmax(450px, 1fr))
- Gap: 32px (horizontal and vertical)
- Width: 100% (within max-width container)

**Single Request Data Loading:**
- `GET /api/v1/projects` returns all projects in one request
- No pagination (all projects <100)
- Client-side filtering and sorting only

---

## 7. Project Card Details

### 7.1 Card Layout (450px × ~240px)

```
┌─────────────────────────────────────┐
│  Parking Lot Survey        [···]    │ ← Title + More menu
│                                     │
│  📷 8 cameras | 📝 3 zones         │ ← Metadata row 1
│  📍 New York, NY                   │ ← Metadata row 2
│                                     │
│  Comprehensive survey with entry    │ ← Description (2 lines)
│  and exit points in downtown mall   │
│                                     │
│  Created: 3 weeks ago              │ ← Timestamp
│  Modified: 2 hours ago             │
│                                     │
│  [Open] [Edit] [Delete]            │ ← Action buttons
│                                     │
└─────────────────────────────────────┘
```

### 7.2 Card Sections

#### Header Row
- **Title** (18px, bold, #1a1a1a): Project name (truncated at ~35 chars)
- **More menu** (···): Dropdown with Edit, Archive, Delete

#### Icon Indicators
- **📷 Cameras:** Count of camera instances
- **📝 Zones:** Count of drawn zones/annotations
- **📍 Location:** Base map location (if set)

Format: `📷 8 cameras | 📝 3 zones` (single line, spaced)

#### Description
- 2 lines max, truncated with ellipsis if longer
- 14px, #666666 (secondary text)
- Optional; if empty, omitted

#### Timestamp
- "Created: X weeks/months ago"
- "Modified: X hours/days ago"
- 12px, #999999 (muted text)

#### Action Buttons
- **[Open]** (Primary, 14px) — Opens project workspace
- **[Edit]** (Secondary, 14px) — Edit project modal
- **[Delete]** (Danger, 14px) — Delete project (with confirmation)

### 7.3 Card States

**Hover:**
- Shadow: 0 10px 15px rgba(0,0,0,0.15)
- Transform: translateY(-4px)
- Transition: all 200ms ease

**Loading/Skeleton:**
- Background: #f5f5f5
- Pulse animation (opacity 0.5 → 1 → 0.5, 1.5s loop)

**Error:**
- Border: 2px solid #dd0000
- Red error icon in corner

---

## 8. Toolbar & Controls

### 8.1 Search Input

```
┌────────────────────────────────────────┐
│ 🔍 Search projects...              ✕  │
└────────────────────────────────────────┘

Width: 300px
Behavior: Filters projects by name (client-side, real-time)
Clear button (✕): Appears when text is entered
Debounce: 300ms
```

### 8.2 Filter Dropdown (Regular User)

```
┌──────────────────────────────────────┐
│ Filter: All Projects ▼               │
└──────────────────────────────────────┘

Open state:
┌──────────────────────────────────────┐
│ ✓ All Projects (12)                  │
├──────────────────────────────────────┤
│ Archived (2)                         │
└──────────────────────────────────────┘
```

### 8.3 Filter Dropdown (Admin User)

```
┌──────────────────────────────────────┐
│ Filter: All Projects ▼               │
└──────────────────────────────────────┘

Open state:
┌──────────────────────────────────────┐
│ ✓ All Projects (24)                  │
├──────────────────────────────────────┤
│ Only Mine (6)                        │
├──────────────────────────────────────┤
│ Archived (4)                         │
└──────────────────────────────────────┘
```

### 8.4 Sort Dropdown

```
┌──────────────────────────────────────┐
│ Sort: Last Modified ▼                │
└──────────────────────────────────────┘

Open state:
┌──────────────────────────────────────┐
│ ✓ Last Modified (Newest)             │
├──────────────────────────────────────┤
│ Last Modified (Oldest)               │
├──────────────────────────────────────┤
│ Name (A–Z)                           │
├──────────────────────────────────────┤
│ Name (Z–A)                           │
├──────────────────────────────────────┤
│ Created (Newest)                     │
├──────────────────────────────────────┤
│ Created (Oldest)                     │
└──────────────────────────────────────┘

Checkmark shows current selection
```

### 8.5 Refresh Button

```
┌──────┐
│  ⟳   │ (Icon only, 40×40px)
└──────┘

Normal: bg transparent, color #666666
Hover: bg #f5f5f5, color #0066cc
Click: Spin animation (360deg, 500ms)
```

### 8.6 Create Project Button

```
┌──────────────────┐
│ + Create Project │
└──────────────────┘

Normal: bg #0066cc, text white
Hover: bg #0052a3, shadow-lg
Active: bg #003d7a, transform scale(0.98)
Focus: outline 2px solid #0066cc, offset 2px
```

---

## 9. Modals & Dialogs

### 9.1 Create Project Modal

```
┌─────────────────────────────────────────────────────┐
│ Create New Project                            [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Project Name *                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ Parking Lot - Downtown                          ││
│ └─────────────────────────────────────────────────┘│
│ Hint: 1–100 characters (required)                   │
│                                                     │
│ Description (optional)                              │
│ ┌─────────────────────────────────────────────────┐│
│ │ Main parking area for downtown mall             ││
│ │ including entry, exit and internal zones        ││
│ └─────────────────────────────────────────────────┘│
│ Hint: 0–500 characters                             │
│                                                     │
│ Base Map Location (optional)                        │
│ ┌─────────────────────────────────────────────────┐│
│ │ Latitude: [40.7128]  Longitude: [-74.0060]     ││
│ │ Zoom Level: [15] (1–22)                         ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Cancel]                      [Create Project]     │
│                               (disabled if empty)  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Dimensions:** 600px wide × auto height

**Validation:**
- Name: 1–100 chars, required
- Description: 0–500 chars, optional
- Lat/Lng: Valid WGS84, optional
- Zoom: 1–22, default 15

### 9.2 Edit Project Modal

```
┌─────────────────────────────────────────────────────┐
│ Edit Project                                  [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Project Name                                        │
│ ┌─────────────────────────────────────────────────┐│
│ │ Parking Lot - Downtown                          ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Description                                         │
│ ┌─────────────────────────────────────────────────┐│
│ │ Main parking area for downtown mall             ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Base Map Location                                   │
│ ┌─────────────────────────────────────────────────┐│
│ │ Latitude: [40.7128]  Longitude: [-74.0060]     ││
│ │ Zoom Level: [15]                                ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Cancel]                        [Save Changes]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 9.3 Delete Project Modal

```
┌─────────────────────────────────────────────────────┐
│ Delete Project                                [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ⚠️  Permanently delete "Parking Lot Survey"?       │
│                                                     │
│ This action cannot be undone. All cameras,         │
│ zones, and reports associated with this project    │
│ will be permanently deleted.                       │
│                                                     │
│ Are you sure?                                       │
│                                                     │
│ Type the project name to confirm:                  │
│ ┌─────────────────────────────────────────────────┐│
│ │ Parking Lot Survey                              ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Cancel]                        [Delete Project]   │
│                                 (red, disabled)    │
│                                                     │
│ Delete button disabled until exact name typed.     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 10. Data & State Management

### 10.1 Zustand Store

```typescript
// src/store/projectSlice.ts
type ProjectSlice = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  
  // Filter/Sort state (client-side)
  filterType: 'all' | 'mine' | 'archived'; // 'mine' only for admin
  sortBy: 'modified_desc' | 'modified_asc' | 'name_asc' | 'name_desc' | 'created_desc' | 'created_asc';
  searchQuery: string;
  
  setProjects: (projects) => void;
  setLoading: (loading) => void;
  setError: (error) => void;
  setFilterType: (filter) => void;
  setSortBy: (sort) => void;
  setSearchQuery: (query) => void;
};
```

### 10.2 React Query Hooks

```typescript
// src/api/projects.ts

// Single request, fetch all projects
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/projects');
      return res.data; // Returns { projects: [...] }
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,   // 10 min
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProjectDTO) => {
      const res = await apiClient.post('/api/v1/projects', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      await apiClient.delete(`/api/v1/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { projectId: string; updates: UpdateProjectDTO }) => {
      const res = await apiClient.put(`/api/v1/projects/${data.projectId}`, data.updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

### 10.3 Data Flow

```
Page Load
  ↓
[Check auth token]
  ↓
useProjects() hook triggers → React Query fetch
  ↓
GET /api/v1/projects → Backend returns all projects
  ↓
{ projects: [ ... ] }
  ↓
Store in React Query cache + Zustand store
  ↓
Render project grid with all projects
  ↓
User filters/sorts → client-side state update + re-render (no API call)
  ↓
User searches → client-side filter + debounce 300ms (no API call)
```

---

## 11. Visual Design System

### 11.1 Color Palette

**Primary Colors:**
- **Primary Blue:** `#0066cc` — Buttons, links, focus states
- **Dark Blue:** `#0052a3` — Hover state
- **Darker Blue:** `#003d7a` — Active state

**Semantic Colors:**
- **Success Green:** `#00aa44` — Confirmations
- **Warning Orange:** `#ff9900` — Alerts
- **Danger Red:** `#dd0000` — Deletions, errors
- **Info Blue:** `#0066cc` — Information

**Neutral Colors:**
- **Text Dark:** `#1a1a1a` — Primary text
- **Text Secondary:** `#666666` — Secondary text, metadata
- **Text Muted:** `#999999` — Timestamps, hints (use #777777 for WCAG compliance)
- **Border:** `#e0e0e0` — Dividers, card borders
- **Background Light:** `#f5f5f5` — Page background
- **Background White:** `#ffffff` — Cards, inputs, modals

### 11.2 Typography

**Font stack:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif

| Element | Size | Weight | Line Height |
|---|---|---|---|
| Page title | 32px | 700 | 1.2 |
| Card title | 18px | 600 | 1.2 |
| Body text | 14px | 400 | 1.6 |
| Small/Label | 12px | 500 | 1.4 |
| Button | 14px | 600 | 1.0 |

### 11.3 Spacing Scale

| Scale | Value | Usage |
|---|---|---|
| xs | 4px | Rare |
| sm | 8px | Inline gaps |
| md | 16px | Card padding |
| lg | 24px | Section gaps |
| xl | 32px | Grid gaps |
| 2xl | 40px | Page margins |

### 11.4 Shadows

| Level | Shadow | Usage |
|---|---|---|
| Soft | 0 4px 6px rgba(0,0,0,0.1) | Card default |
| Elevated | 0 10px 15px rgba(0,0,0,0.15) | Card hover, dropdowns |
| High | 0 20px 25px rgba(0,0,0,0.2) | Modals |

---

## 12. Interaction Patterns

### 12.1 Create Project Flow

```
User clicks [+ Create Project]
  ↓
Modal opens (form empty)
  ↓
User fills name, description, location (optional)
  ↓
User clicks [Create Project]
  ↓
POST /api/v1/projects → Backend creates
  ↓
Success:
  ├─ Modal closes
  ├─ useProjects refetch (invalidate query)
  ├─ Projects list updates with new project
  ├─ Success toast: "Project created"
  
Failure:
  ├─ Modal stays open
  ├─ Error shown in modal
  ├─ Retry available
  └─ Error toast
```

### 12.2 Search & Filter Workflow

```
User types in search box
  ↓
Debounce 300ms
  ↓
Client-side filter on project name (no API call)
  ↓
Results update instantly

User clicks Filter dropdown
  ↓
Selects "Archived"
  ↓
Projects list re-filters client-side
  ↓
Count updates (e.g., "2 archived projects")
  
User clicks Sort dropdown
  ↓
Selects "Name (A–Z)"
  ↓
Projects list re-sorts client-side
```

### 12.3 Edit Project Flow

```
User clicks card [Edit]
  ↓
Edit modal opens (pre-populated with current data)
  ↓
User modifies fields
  ↓
User clicks [Save Changes]
  ↓
PUT /api/v1/projects/{id} → Backend updates
  ↓
Success:
  ├─ Modal closes
  ├─ useProjects refetch
  ├─ Card updates on dashboard
  ├─ Toast: "Project updated"
  
Failure:
  ├─ Modal stays open
  ├─ Error shown
  └─ Retry available
```

### 12.4 Delete Project Flow

```
User clicks card [Delete]
  ↓
Danger confirmation modal appears
  ↓
User must type exact project name to confirm
  ↓
[Delete] button becomes enabled (red)
  ↓
User clicks [Delete]
  ↓
DELETE /api/v1/projects/{id}
  ↓
Success:
  ├─ Modal closes
  ├─ Card animates out (fade 200ms)
  ├─ useProjects refetch
  └─ Toast: "Project deleted"
  
Failure:
  ├─ Modal stays open
  ├─ Error shown
  └─ Retry available
```

---

## 13. Performance & Optimization

### 13.1 Data Fetching (Single Request)

**Initial load:**
- `GET /api/v1/projects` — All projects in one request
- Expected: <100 projects per user
- No pagination needed

**Caching:**
- Projects: 5-minute stale time
- Refetch on window focus by default
- Invalidate on create/update/delete

### 13.2 Client-Side Operations

**All client-side (no API calls):**
- Searching (filter by name)
- Filtering (all/archived/mine)
- Sorting (6 sort options)

**Debouncing:**
- Search input: 300ms debounce

### 13.3 Rendering Optimization

**Memoization:**
- `ProjectCard` wrapped in `React.memo()`
- Selectors memoized

**Lazy rendering:**
- Modals render only when open

### 13.4 Bundle Size

**Expected imports:**
- React, React Router, React Query: ~100KB (gzipped)
- Zustand: ~2KB
- Tailwind CSS: ~20–30KB
- Icons: ~2KB per icon

**Total:** ~150–200KB (gzipped)

---

## 14. Implementation Roadmap

### Phase 1 (Week 2, M1 — Foundation)

- [x] React + Vite scaffold
- [x] Create `src/pages/DashboardPage.tsx`
- [x] Create `src/components/layout/Navbar.tsx`
- [x] Create `src/store/projectSlice.ts`
- [x] Create `src/api/projects.ts` (single request)
- [x] Wire up dummy projects list

### Phase 2 (Weeks 3–4, M1–M2 — Core Dashboard)

- [x] Implement full Navbar with user menu (regular vs admin)
- [x] Create `src/components/project/ProjectCard.tsx`
- [x] Create `src/components/project/ProjectList.tsx`
- [x] Create `src/components/project/ProjectToolbar.tsx`
- [x] Create `src/components/project/CreateProjectModal.tsx`
- [x] Create `src/components/project/EditProjectModal.tsx`
- [x] Create `src/components/project/DeleteProjectModal.tsx`
- [x] Create `src/components/project/EmptyState.tsx`
- [x] Connect to backend API (`GET /api/v1/projects`)
- [x] Implement CRUD flows
- [x] Add pagination/loading states

### Phase 3 (Week 1, M2 — Interactions)

- [ ] Implement client-side search/filter/sort
- [ ] Add loading states and error handling
- [ ] Polish visual design and transitions
- [ ] Add keyboard shortcuts

### Phase 4 (Week 2, M3)

- [ ] Admin-specific features:
  - Conditional navbar menu
  - "All Projects" view for admin
  - "Only Mine" filter for admin
  - Manage Users page

### Phase 5 (M5 — Polish & Testing)

- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Unit tests (filtering, sorting, search)
- [ ] E2E tests (CRUD flows)
- [ ] Performance profiling
- [ ] Responsive design across breakpoints
- [ ] Security review

---

## 15. Accessibility Standards

### 15.1 WCAG 2.1 Level AA Compliance

**Color Contrast:**
- All text: 4.5:1 ratio for normal, 3:1 for large
- Use #777777 instead of #999999 for timestamps

**Focus Management:**
- All interactive elements keyboard-accessible
- Visible focus indicator on all elements
- Tab order: left-to-right, top-to-bottom

**ARIA Labels:**
- Modal: `role="dialog"`, `aria-labelledby`, `aria-modal="true"`
- Dropdowns: `role="listbox"`, menu items `role="option"`
- Buttons: Descriptive text or `aria-label`
- Loading: `aria-busy="true"`

**Keyboard Shortcuts:**
- Ctrl+K / Cmd+K: Focus search
- Ctrl+N / Cmd+N: Open create modal
- Esc: Close modal/dropdown
- Tab/Shift+Tab: Navigate
- Enter: Activate button, submit form

---

## 16. File Structure

```
packages/frontend/src/
├── pages/
│   └── DashboardPage.tsx              ← Main landing page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                 ← Global header
│   │   ├── UserMenu.tsx               ← User dropdown
│   │   └── GlobalSearch.tsx           ← Search bar
│   └── project/
│       ├── ProjectCard.tsx            ← Single card
│       ├── ProjectList.tsx            ← Grid layout
│       ├── ProjectToolbar.tsx         ← Controls
│       ├── CreateProjectModal.tsx
│       ├── EditProjectModal.tsx
│       ├── DeleteProjectModal.tsx
│       ├── ProjectCardSkeleton.tsx
│       └── EmptyState.tsx
├── store/
│   └── projectSlice.ts                ← Zustand
└── api/
    └── projects.ts                    ← React Query hooks
```

---

**Design specification complete. Final version — Admin & Regular User only, no clone, single request data fetching, all client-side filtering and sorting.**
