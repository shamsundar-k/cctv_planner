# Admin Dashboard - Visual Reference & Feature Showcase

## 📸 Dashboard Sections Visual Guide

### Section 1: Header & Top Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│  [🛡️ Admin Hub]                      [● System Online]           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Gradient glowing logo effect
- Live system status indicator
- Responsive hamburger menu on mobile

---

### Section 2: Statistics Cards (4-Column Layout)

```
┌────────────────┬────────────────┬────────────────┐
│ 👥 Users       │ 📁 Projects    │ 📹 Cameras     │     
│ Total Users    │ Total Projects │ Total Cameras  │   
│                │                │                │                
│     [4]        │      [5]       │     [125]      │         
│                │                │                │                
│ 3 standard     │ 125 total      │ across all     │    
│ users          │ cameras        │ projects       │        
└────────────────┴────────────────┴────────────────┘
```

**Features:**
- Gradient background per card (Blue, Cyan, Purple)
- Icon badges with color coding
- Number emphasis with large fonts
- Subtitle with additional context
- Hover effects with glowing borders

---

### Section 3: Tab Navigation

```
┌──────────────────────────────────────────────────────────────────┐
│ ▸ Overview │ Users │ Projects │ Invite History                   │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- 4 tabs with smooth transition animations
- Active tab indicator (cyan underline)
- Hover states for inactive tabs
- Easy switching between sections

---

## 🎨 Feature Showcase

### Feature 1: Create User Invite

```
╔══════════════════════════════════════════════════════════════════╗
║ 📧 Create User Invite                                            ║
║ Generate a single-use invite token                               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  📧 [newuser@example.com________________]                        ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │  ✨ Generate Invite                                      │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  ✅ Invite Generated Successfully!                              ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║  Share this link with the user:                                 ║
║                                                                  ║
║  https://cctv-planner.app/accept-invite?token=...              ║
║                                                                  ║
║  ⏱️  Valid for 72 hours. User must complete registration.       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Interactions:**
- Input field with email validation
- Loading state with spinner during generation
- Success message with copy-ready URL
- Auto-dismiss after 5 seconds

---

### Feature 2: Users Management Table

```
╔══════════════════════════════════════════════════════════════════╗
║ 🔍 [Search users by email or name...________]                   ║
╠══════════════════════════════════════════════════════════════════╣
║ USER                    ROLE           PROJECTS    JOINED        ║
├──────────────────────────────────────────────────────────────────┤
║ 👤 John Doe            [Editor]          3      Jan 22, 2024    ║
║    john.doe@ex...      ───────                                   ║
│                                                      [Remove ✕]   │
├──────────────────────────────────────────────────────────────────┤
║ 👤 Sarah Smith         [User]            7      Mar 5, 2024     ║
║    sarah.smith@ex...   ───────                                   ║
│                                                      [Remove ✕]   │
├──────────────────────────────────────────────────────────────────┤
║ 👤 Mike Johnson        [User]            2      Jan 22, 2024    ║
║    mike.johnson@ex...  ───────                                   ║
│                                                      [Remove ✕]   │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Searchable table with real-time filtering
- Avatar with user initials in gradient
- Role badges (color-coded)
- Display name and email
- Delete button with hover effect
- Hover row highlighting

---

### Feature 3: Projects Management Cards

```
╔═══════════════════════════════╗  ╔═══════════════════════════════╗
║ 📁 City Hall Security      [✕] ║  ║ 📁 Airport Terminal A      [✕] ║
║ by John Doe                    ║  ║ by Sarah Smith                 ║
├───────────────────────────────┤  ├───────────────────────────────┤
║ Cameras          12            ║  ║ Cameras          28            ║
║ Collaborators    3             ║  ║ Collaborators    5             ║
║ Created          Jan 10, 2024  ║  ║ Created          Feb 14, 2024 ║
├───────────────────────────────┤  ├───────────────────────────────┤
║ [👁️ View]                      ║  ║ [👁️ View]                      ║
╚═══════════════════════════════╝  ╚═══════════════════════════════╝

╔═══════════════════════════════╗  ╔═══════════════════════════════╗
║ 📁 Retail District         [✕] ║  ║ 📁 Hospital Campus         [✕] ║
║ by John Doe                    ║  ║ by Sarah Smith                 ║
├───────────────────────────────┤  ├───────────────────────────────┤
║ Cameras          8             ║  ║ Cameras          35            ║
║ Collaborators    2             ║  ║ Collaborators    8             ║
║ Created          Jan 10, 2024  ║  ║ Created          Feb 14, 2024 ║
├───────────────────────────────┤  ├───────────────────────────────┤
║ [👁️ View]                      ║  ║ [👁️ View]                      ║
╚═══════════════════════════════╝  ╚═══════════════════════════════╝
```

**Features:**
- 2-column responsive grid
- Project name with owner
- Key statistics
- View and Delete buttons
- Hover card elevation effect
- Delete button appears on hover

---

### Feature 4: Invite History with Expiry Countdown

```
╔══════════════════════════════════════════════════════════════════╗
║ Email: newuser@example.com                                       ║
║ Created: Mar 10, 2026 10:30 AM                                  ║
│                                                    [Copy] [Copied]│
│ https://cctv-planner.app/accept-invite?token=invite_ABC123XYZ  │
│                                                                  │
│ Progress: ████████████░░░░░░░░░░░░░░░░░░░░ 36h remaining       │
╚══════════════════════════════════════════════════════════════════╝
```

**Features:**
- Email and timestamp display
- Full invite URL in code block
- Copy-to-clipboard button
- Visual expiry progress bar
- Time remaining countdown
- List of all recent invites
- Chronological ordering (newest first)

---

### Feature 5: Delete Confirmation Modal

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                    ⚠️  Delete User?                              ║
║                                                                  ║
║  Are you sure you want to delete John Doe?                      ║
║  This action cannot be undone.                                  ║
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │          [Cancel]              [Delete - Confirm]       │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Features:**
- Large warning icon
- Clear action text
- Name of item being deleted
- Cancel and Delete buttons
- Red delete button for emphasis
- Slide-up animation
- Prevents accidental actions

---

## 🎯 Responsive Behavior

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────┐
│ [Logo]                            [Admin] [User Menu]│
├─────────────────────────────────────────────────────┤
│ [Card] [Card] [Card] [Card]                         │
├─────────────────────────────────────────────────────┤
│ Tab1 | Tab2 | Tab3 | Tab4                           │
├─────────────────────────────────────────────────────┤
│ [Content - Full Width]                              │
├─────────────────────────────────────────────────────┤
│ [2x2 Grid] [2x2 Grid]  or  [Full Width Table]      │
└─────────────────────────────────────────────────────┘
```

### Tablet (768px-1023px)
```
┌──────────────────────────────┐
│ [Logo]        [Admin] [Menu] │
├──────────────────────────────┤
│ [Card] [Card]                │
│ [Card] [Card]                │
├──────────────────────────────┤
│ Tab1 | Tab2 | Tab3 | Tab4    │
├──────────────────────────────┤
│ [2x1 Grid]                   │
│ [2x1 Grid]                   │
└──────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────┐
│ [Logo] [≡ Menu]  │
├──────────────────┤
│ [Card - Full]    │
│ [Card - Full]    │
│ [Card - Full]    │
├──────────────────┤
│ Tab1 | Tab2  Tab3│
├──────────────────┤
│ [Content]        │
│ [Scrollable]     │
│ [Stack]          │
└──────────────────┘
```

---

## 🎨 Color Palette Reference

### Primary Colors
```
Blue        #3b82f6  - Primary actions, selection
Cyan        #06b6d4  - Accent, hover states
Slate-900   #0f172a  - Background
Slate-800   #1e293b  - Card background
```

### Secondary Colors (Accent)
```
Purple      #a855f7  - Secondary importance
Pink        #ec4899  - Delete actions, warnings
Emerald     #10b981  - Success states
Red         #ef4444  - Danger, delete
```

### Text Colors
```
White               - Primary text (#ffffff)
Slate-400          - Secondary text (#94a3b8)
Slate-500          - Tertiary text (#64748b)
```

### States
```
Success      Green    #10b981  (bg opacity 10%, text opacity 100%)
Error        Red      #ef4444  (bg opacity 10%, text opacity 100%)
Warning      Amber    #f59e0b  (bg opacity 10%, text opacity 100%)
Info         Blue     #3b82f6  (bg opacity 10%, text opacity 100%)
```

---

## ⌨️ Keyboard Navigation

### Tab Order
1. Search input (if on Users/Projects tab)
2. Email input (if on Overview tab)
3. Generate Invite button
4. Users/Projects table cells and buttons
5. Tab navigation buttons
6. Modal buttons (when modal open)


---

## 🎬 Animation Details

### Fade In (Tab Switch)
```
Duration: 300ms
Easing:   ease-out
From:     opacity: 0
To:       opacity: 1
```

### Slide Up (Modal Entry)
```
Duration: 300ms
Easing:   ease-out
From:     translateY(10px), opacity: 0
To:       translateY(0), opacity: 1
```

### Slide Down (Success Message)
```
Duration: 300ms
Easing:   ease-out
From:     translateY(-10px), opacity: 0
To:       translateY(0), opacity: 1
```

### Hover Glow (Cards)
```
Duration: 300ms
Effect:   Gradient blur background
Trigger:  .group:hover > .absolute
```

### Loading Spinner
```
Animation: spin
Duration:  2s
Direction: infinite
Transform: rotate(360deg)
```

---

## 📊 Component Hierarchy

```
AdminDashboard (Root)
├── Header
│   ├── Logo with glow effect
│   └── System status indicator
├── Stats Cards Container
│   ├── UserCard
│   ├── ProjectCard
│   ├── CameraCard
│   └── AverageCard
├── Tab Navigation
│   ├── Overview Tab Button
│   ├── Users Tab Button
│   ├── Projects Tab Button
│   └── Invites Tab Button
├── Content Area (Tab-dependent)
│   ├── Overview Tab Content
│   │   ├── Invite Form Section
│   │   └── Quick Stats
│   ├── Users Tab Content
│   │   ├── Search Bar
│   │   └── Users Table
│   ├── Projects Tab Content
│   │   ├── Search Bar
│   │   └── Projects Grid
│   └── Invites Tab Content
│       └── Invites List
└── Delete Confirmation Modal (Conditional)
    ├── Warning Icon
    ├── Message
    └── Buttons
```

---

## 🎯 Usage Flows

### Flow 1: Generate User Invite
```
1. Click "Overview" tab
2. Enter email: newuser@example.com
3. Click "Generate Invite"
4. See success message with URL
5. Click "Copy" to copy URL
6. Share URL with new user
```

### Flow 2: Delete a User
```
1. Click "Users" tab
2. Find user in table
3. Click "Remove" button
4. See delete confirmation modal
5. Click "Delete" to confirm
6. User is removed from table
7. See success notification
```

### Flow 3: Search Projects
```
1. Click "Projects" tab
2. Type in search box: "airport"
3. See filtered results immediately
4. Click "View" to open project details
5. Click "Delete" to remove project (with confirmation)
```

### Flow 4: Track Invite Status
```
1. Click "Invite History" tab
2. See list of generated invites
3. View expiry countdown for each
4. Click "Copy" to get shareable URL
5. Share links as needed
```

---

## 🔍 Data Display Examples

### User Entry
```
Avatar | Display Name        | Email                 | Role    | Projects | Joined      | Action
[JD]   | John Doe           | john.doe@example.com  | Editor  | 3        | Jan 22, 24  | [Remove]
[SS]   | Sarah Smith        | sarah@example.com     | User    | 7        | Mar 5, 24   | [Remove]
```

### Project Card
```
📁 City Hall Security
by John Doe

Cameras          12
Collaborators    3
Created          Jan 10, 2024

[👁️ View] [Delete]
```

### Invite Entry
```
Email:     newuser@example.com
Created:   Mar 10, 2026 10:30 AM
URL:       https://cctv-planner.app/accept-invite?token=invite_ABC123
Expiry:    ████████████░░░░░░░░░░░░░░░░░░░░ 36h remaining
Action:    [Copy] or [Copied]
```

---

## 🎪 Theme Customization Examples

### Dark Theme (Current)
```css
Background:  slate-900 to slate-950
Cards:       slate-800/50 with slate-700/50 border
Text:        white (primary), slate-400 (secondary)
Accent:      blue-500, cyan-500
```

### Light Theme (Alternative)
```css
Background:  white to gray-50
Cards:       white with gray-200 border
Text:        gray-900 (primary), gray-600 (secondary)
Accent:      blue-600, cyan-600
```

### High Contrast (Accessibility)
```css
Background:  black
Cards:       white border, black background
Text:        white (primary), black background
Accent:      yellow (#ffff00), bright colors
```

---

## 📐 Layout Grid System

The dashboard uses Tailwind's grid system with customization:

```
Desktop:  grid-cols-4 (stats), grid-cols-2 (projects), 1 col (table)
Tablet:   grid-cols-2 (stats), grid-cols-2 (projects), 1 col (table)
Mobile:   grid-cols-1 (all)
Gap:      6 units (24px standard spacing)
```

---

## 🎬 Loading States

### Page Loading
```
┌─────────────────────────────┐
│                             │
│        ⟲ Loading...         │
│                             │
└─────────────────────────────┘
```

### Invite Generation Loading
```
Button State: [⟲ Generating...] (disabled)
```

### Data Loading (Table)
```
[Loading rows with skeleton effect...]
```

---

## ✨ Polish Details

### Shadows & Depth
- Cards: `shadow-none` (light theme) to `shadow-2xl` on hover
- Modals: `shadow-2xl` with dark backdrop blur
- Buttons: `shadow-sm` on hover

### Border Radius
- Cards & Containers: `rounded-2xl` (16px)
- Buttons & Inputs: `rounded-lg` (8px)
- Badges: `rounded-full` (50%)
- Icons: Variable (inherit)

### Spacing
- Container padding: `px-6 py-8`
- Card padding: `p-6` to `p-8`
- Element gap: `gap-3` to `gap-6`
- Row gap: `py-4`

### Opacity & Transparency
- Background overlays: `opacity-50` to `opacity-100`
- Disabled states: `opacity-50`
- Hover reveals: `opacity-0` → `opacity-100`

---

This visual guide ensures consistent implementation and easy customization!
