# CCTV Survey Planner — Landing Page Desktop Mockups (Final V4)
## Admin & Regular User, No Clone, Single Data Request

**Version:** 4.0  
**Date:** March 2026

---

## 1. Full Dashboard Page (1920px Desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, height: 64px)                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ▣ CCTV Survey Planner   [Search: Open projects...]  🔔  👤▼ ❓      │  │
│  │                          (Press Ctrl+K)                                │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  [Page margin: 40px]                                                          │
│                                                                               │
│  My Projects (or "All Projects" for Admin)                                  │
│                                                                               │
│  [+ Create Project]  [Search] [Filter▼] [Sort: Last Modified▼] [⟳]         │
│  12 projects | Updated 2 minutes ago                                        │
│                                                                               │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐    │
│  │                      │ │                      │ │                 │    │
│  │  PROJECT CARD 1      │ │  PROJECT CARD 2      │ │ PROJECT CARD 3  │    │
│  │  (450px × 240px)     │ │  (450px × 240px)     │ │ (450px × 240px) │    │
│  │                      │ │                      │ │                 │    │
│  │ Parking Lot Survey   │ │ Retail Mall          │ │ Airport Terminal│    │
│  │ 📷8 📝3 📍NYC       │ │ 📷12 📝5 📍LA       │ │ 📷24 📝7 📍MIA │    │
│  │                      │ │                      │ │                 │    │
│  │ Comprehensive survey │ │ Ground & mezzanine   │ │ Perimeter sec.  │    │
│  │ with entry & exit...  │ │ parking coverage...  │ │ Full terminal   │    │
│  │                      │ │                      │ │                 │    │
│  │ Created: 3 weeks ago │ │ Created: 2 weeks ago │ │ Created: 1 week │    │
│  │ Modified: 2 hours ago│ │ Modified: 1 day ago  │ │ Modified: 3 days│    │
│  │                      │ │                      │ │                 │    │
│  │ [Open] [Edit] [Delete] │ │ [Open] [Edit] [Delete] │ │ [Open] [Edit] [Delete]│    │
│  │                      │ │                      │ │                 │    │
│  └──────────────────────┘ └──────────────────────┘ └─────────────────┘    │
│                                                                               │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐    │
│  │  PROJECT CARD 4      │ │  PROJECT CARD 5      │ │ PROJECT CARD 6  │    │
│  │ Downtown Security    │ │ Museum - East Wing   │ │ Bank HQ         │    │
│  │ 📷15 📝4 📍CHI      │ │ 📷5 📝2 📍BOS      │ │ 📷6 📝2 📍DEN │    │
│  │                      │ │                      │ │                 │    │
│  │ Network of 6 entrances                        │ │ 3-floor coverage│    │
│  │ ...                  │ │ ...                  │ │ ...             │    │
│  │                      │ │                      │ │                 │    │
│  │ Created: 1 month ago │ │ Created: 2 months ago│ │ Created: 1 month│    │
│  │ Modified: 5 days ago │ │ Modified: 1 week ago │ │ Modified: 2 weeks│   │
│  │                      │ │                      │ │                 │    │
│  │ [Open] [Edit] [Delete] │ │ [Open] [Edit] [Delete] │ │ [Open] [Edit] [Delete]│    │
│  └──────────────────────┘ └──────────────────────┘ └─────────────────┘    │
│                                                                               │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐    │
│  │  PROJECT CARD 7      │ │  PROJECT CARD 8      │ │ PROJECT CARD 9  │    │
│  │ Warehouse Security   │ │ Retail Store (Old)   │ │ (Archived)      │    │
│  │ 📷8 📝3 📍SAC      │ │ 📷4 📝1 📍PHX      │ │ Data Center     │    │
│  │                      │ │                      │ │ 📷18 📝6 📍ATL │    │
│  │ ...                  │ │ ...                  │ │ (Archived)      │    │
│  │                      │ │                      │ │                 │    │
│  │ [Open] [Edit] [Delete] │ │ [Open] [Edit] [Delete] │ │ [Open] [Edit] [Delete]│    │
│  └──────────────────────┘ └──────────────────────┘ └─────────────────┘    │
│                                                                               │
│  [Page margin: 40px]                                                          │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Navbar (Regular User vs Admin)

### Regular User Navbar
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ▣ CCTV Survey Planner   [Search: Open projects... (Ctrl+K)]  🔔  👤▼ ❓   │
│  Planner                                                                      │
└──────────────────────────────────────────────────────────────────────────────┘

Height: 64px
Background: white
Box-shadow: 0 2px 4px rgba(0,0,0,0.05)
```

### Regular User Menu
```
                                                    ┌──────────────────────┐
                                                    │ John Smith           │
                                                    │ john@example.com     │
                                                    │ ──────────────────── │
                                                    │ My Profile           │
                                                    │ Settings             │
                                                    │ Help & Documentation │
                                                    │ ──────────────────── │
                                                    │ Logout               │
                                                    └──────────────────────┘
```

### Admin User Menu
```
                                                    ┌──────────────────────┐
                                                    │ Admin User           │
                                                    │ admin@example.com    │
                                                    │ ──────────────────── │
                                                    │ My Profile           │
                                                    │ Settings             │
                                                    │ Manage Users         │ ← Admin only
                                                    │ Help & Documentation │
                                                    │ ──────────────────── │
                                                    │ Logout               │
                                                    └──────────────────────┘
```

---

## 3. Project Card (450px × 240px)

### Card Structure
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

### Card More Menu (···)
```
┌──────────────────────────┐
│ Edit Project             │
├──────────────────────────┤
│ Archive Project          │
├──────────────────────────┤
│ Delete Project           │ (red text)
└──────────────────────────┘

Position: Fixed, right-aligned below [···]
Box-shadow: 0 20px 25px rgba(0,0,0,0.2)
Background: white
Border: 1px solid #e0e0e0
Border-radius: 6px
```

### Card States
```
DEFAULT:
  Background: white
  Border: 1px solid #e0e0e0
  Shadow: 0 4px 6px rgba(0,0,0,0.1)

HOVER:
  Shadow: 0 10px 15px rgba(0,0,0,0.15)
  Transform: translateY(-4px)
  Transition: all 200ms ease

LOADING:
  Background: #f5f5f5
  Pulse animation: opacity 0.5 → 1 → 0.5 (1.5s)
```

---

## 4. Toolbar Section

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│ My Projects (or "All Projects" for Admin)                         │
│                                                                    │
│ [+ Create Project]  [Search] [Filter ▼] [Sort: Last Modified ▼] │
│                                                          [⟳]      │
│                                                                    │
│ 12 projects | Updated 2 minutes ago                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Search Input
```
┌────────────────────────────────────────┐
│ 🔍 Search projects...              ✕  │
└────────────────────────────────────────┘

Width: 300px
Behavior: Real-time filter by name (client-side, 300ms debounce)
Clear (✕): Appears when text entered
```

### Filter Dropdown (Regular User)
```
┌──────────────────────────────────────┐
│ Filter: All Projects ▼               │
└──────────────────────────────────────┘

Open:
┌──────────────────────────────────────┐
│ ✓ All Projects (12)                  │
├──────────────────────────────────────┤
│ Archived (2)                         │
└──────────────────────────────────────┘
```

### Filter Dropdown (Admin User)
```
┌──────────────────────────────────────┐
│ Filter: All Projects ▼               │
└──────────────────────────────────────┘

Open:
┌──────────────────────────────────────┐
│ ✓ All Projects (24)                  │
├──────────────────────────────────────┤
│ Only Mine (6)                        │
├──────────────────────────────────────┤
│ Archived (4)                         │
└──────────────────────────────────────┘
```

### Sort Dropdown
```
┌──────────────────────────────────────┐
│ Sort: Last Modified ▼                │
└──────────────────────────────────────┘

Open:
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
```

### Create Button
```
┌──────────────────┐
│ + Create Project │
└──────────────────┘

Normal: bg #0066cc, text white
Hover: bg #0052a3, shadow-lg
Active: bg #003d7a, transform scale(0.98)
```

### Refresh Button
```
┌──────┐
│  ⟳   │ (40×40px)
└──────┘

Normal: bg transparent, color #666666
Hover: bg #f5f5f5, color #0066cc
Click: Spin 360deg (500ms)
```

---

## 5. Create Project Modal (600px wide)

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
│ (Secondary)                   (Primary, disabled)  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. Edit Project Modal (600px wide)

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

---

## 7. Delete Project Modal (Danger Confirmation)

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
│ Then turns bright red.                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 8. Empty State

```
┌────────────────────────────────────────────────────┐
│                                                    │
│                     🎯                             │
│                                                    │
│              No Projects Yet                       │
│                                                    │
│ You haven't created any projects. Start by        │
│ creating your first CCTV survey project.          │
│                                                    │
│ [+ Create Your First Project] [Docs] [Help]      │
│                                                    │
│ (Centered on page, subtle background)             │
│                                                    │
└────────────────────────────────────────────────────┘

Background: Light grey (#f5f5f5)
Border: 1px solid #e0e0e0
Border-radius: 8px
Padding: 60px 40px
Text alignment: center
```

---

## 9. Loading States

### Skeleton Card (Pulse Animation)
```
┌──────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Pulsing
│                                          │
│ ░░░░░░░░░░░░░░░░ ░░░░░░░░░░░░░░░░░░░░ │
│                                          │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                          │
│ ░░░░░░░░░░░░░░░░░░░░ ░░░░░░░░░░░░░░░░ │
│                                          │
│ ░░░░░░░░░ ░░░░░░░░░ ░░░░░░░░░         │
│                                          │
└──────────────────────────────────────────┘

Animation: opacity 0.5 → 1 → 0.5 (1.5s)
Color: #f0f0f0
Show 12 skeleton cards (matching grid)
```

### Modal Loading
```
┌──────────────────┐
│ ⟳ Creating...    │ (Spinner, disabled)
└──────────────────┘
```

---

## 10. Error States

### Success Toast
```
┌──────────────────────────────────────────┐
│ ✅ Project created successfully          │
│    "Parking Lot Survey" is ready         │
│                                     [✕]  │ ← Auto-close 5s
└──────────────────────────────────────────┘
Background: #f0fdf4
Border: 1px solid #86efac
Text: #166534
```

### Error Toast
```
┌──────────────────────────────────────────┐
│ ❌ Failed to create project              │
│    Please check your input and try again │
│                                     [✕]  │ ← User must dismiss
└──────────────────────────────────────────┘
Background: #fef2f2
Border: 1px solid #fecaca
Text: #7f1d1d
```

### Form Validation Error
```
Project Name *
┌────────────────────────────────────────┐
│                                        │
└────────────────────────────────────────┘ ← Red border: 2px #dd0000

❌ Project name is required (12px, #dd0000)
```

---

## 11. Breakpoint Layouts

### 1024px Desktop (2-column minimum)
```
[Margin: 32px]

┌────────────────────┐ ┌────────────────────┐
│  PROJECT CARD 1    │ │  PROJECT CARD 2    │
│  (420px)           │ │  (420px)           │
└────────────────────┘ └────────────────────┘
  [Gap: 24px]

┌────────────────────┐ ┌────────────────────┐
│  PROJECT CARD 3    │ │  PROJECT CARD 4    │
└────────────────────┘ └────────────────────┘
```

### 1600px Desktop (3-column typical)
```
[Margin: 40px]

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ PROJECT CARD 1 │ │ PROJECT CARD 2 │ │ PROJECT CARD 3 │
│ (450px)        │ │ (450px)        │ │ (450px)        │
└────────────────┘ └────────────────┘ └────────────────┘
   [Gap: 32px]

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ PROJECT CARD 4 │ │ PROJECT CARD 5 │ │ PROJECT CARD 6 │
└────────────────┘ └────────────────┘ └────────────────┘
```

### 1920px Desktop (4-column full HD)
```
[Margin: 40px]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PROJECT CARD1│ │ PROJECT CARD2│ │ PROJECT CARD3│ │ PROJECT CARD4│
│ (450px)      │ │ (450px)      │ │ (450px)      │ │ (450px)      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
    [Gap: 32px]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PROJECT CARD5│ │ PROJECT CARD6│ │ PROJECT CARD7│ │ PROJECT CARD8│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 12. Color Palette

| Color | Hex | Usage |
|---|---|---|
| Primary Blue | #0066cc | Buttons, focus, links |
| Blue Hover | #0052a3 | Button hover |
| Blue Active | #003d7a | Button active |
| Success Green | #00aa44 | Confirmations |
| Danger Red | #dd0000 | Errors, delete |
| Text Dark | #1a1a1a | Primary text |
| Text Gray | #666666 | Secondary text |
| Text Muted | #999999 | Timestamps (use #777777 for WCAG) |
| Border | #e0e0e0 | Dividers |
| Background Light | #f5f5f5 | Page background |
| Background White | #ffffff | Cards, inputs, modals |

---

## 13. Typography

| Element | Size | Weight | Usage |
|---|---|---|---|
| Page heading | 32px | 700 | "My Projects" |
| Card title | 18px | 600 | Project name |
| Body | 14px | 400 | Descriptions, metadata |
| Small/Label | 12px | 500 | Timestamps, hints |
| Button | 14px | 600 | All buttons |

---

## 14. Accessibility

### Focus Indicators
```
Button focused:
┌──────────────────┐
│ + Create Project │ ← Outline 2px #0066cc, offset 2px
└──────────────────┘

Input focused:
┌──────────────────┐
│ Project name |   │ ← Border 2px #0066cc
└──────────────────┘
```

### Keyboard Tab Order
1. Navbar search
2. User menu
3. [+ Create] button
4. [Search] input
5. [Filter] dropdown
6. [Sort] dropdown
7. [Refresh] button
8. First card [Open]
9. First card [Edit]
10. First card [Delete]
(continues through all cards)

### Color Contrast
```
#1a1a1a on #ffffff: 16.5:1 ✓ AAA
#ffffff on #0066cc: 6.5:1  ✓ AAA
#ffffff on #dd0000: 3.9:1  ✓ AA
#666666 on #ffffff: 5.3:1  ✓ AA
Use #777777 for timestamps: 4.4:1 ✓ AA
```

---

**Final mockups complete. Admin & Regular User only, no clone feature, single data request from backend, all client-side filtering/sorting.**
