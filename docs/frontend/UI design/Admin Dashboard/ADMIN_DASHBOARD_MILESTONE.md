# Admin Dashboard — Implementation Milestone

**Project:** CCTV Survey Planner  
**Route:** `/admin/manage`  
**Version:** 1.0  
**Target:** March 2026

---

## Milestone 1 — Project Setup & File Structure

- [ ] Create directory `packages/frontend/src/components/admin/`
- [ ] Create directory `packages/frontend/src/pages/` (if not exists)
- [ ] Create directory `packages/frontend/src/api/` (if not exists)
- [ ] Verify dependencies installed: `@tanstack/react-query`, `axios`, `lucide-react`

---

## Milestone 2 — Backend API Verification

- [ ] **Users endpoint**
  - [ ] Verify `GET /api/v1/admin/users` returns `{ users: [...] }`
  - [ ] Confirm response fields: `id`, `email`, `full_name`, `system_role`, `created_at`
  - [ ] Verify admin JWT authentication is enforced

- [ ] **Projects endpoint**
  - [ ] Verify `GET /api/v1/projects` returns `{ projects: [...] }`
  - [ ] Confirm response fields: `id`, `name`, `owner_id`, `camera_count`, `created_at`

- [ ] **Invite endpoint**
  - [ ] Verify `POST /api/v1/admin/invite` accepts `{ email: string }`
  - [ ] Confirm response includes `invite_url`, `token`, `expires_at`
  - [ ] Verify 72-hour token TTL is set server-side

- [ ] **Delete endpoints**
  - [ ] Verify `DELETE /api/v1/admin/users/{user_id}` returns `{ success: true }`
  - [ ] Verify `DELETE /api/v1/projects/{project_id}` returns `{ success: true }`

- [ ] **Security**
  - [ ] Server-side admin role check (`system_role === 'admin'`) on all endpoints
  - [ ] Rate limiting applied to invite and delete endpoints
  - [ ] Audit logging enabled for admin actions

---

## Milestone 3 — API Hooks

- [ ] Create `packages/frontend/src/api/admin.ts`
  - [ ] `useAdminUsers()` — `GET /api/v1/admin/users`
  - [ ] `useAdminProjects()` — `GET /api/v1/projects`
  - [ ] `useGenerateInvite()` — `POST /api/v1/admin/invite`
  - [ ] `useDeleteUser()` — `DELETE /api/v1/admin/users/{id}`
  - [ ] `useDeleteProject()` — `DELETE /api/v1/projects/{id}`
  - [ ] Configure query caching & stale time
  - [ ] Add optimistic updates with rollback on error
  - [ ] Add retry logic
  - [ ] Add debounced search hooks: `useSearchUsers()`, `useSearchProjects()`

---

## Milestone 4 — AdminDashboard Component

- [ ] Create `packages/frontend/src/components/admin/AdminDashboard.jsx`

- [ ] **Overview Tab**
  - [ ] Stat cards: Total Users, Total Projects, Total Cameras
  - [ ] Quick invite generation form with email validation
  - [ ] Success toast on invite generation with auto-copy

- [ ] **Users Tab**
  - [ ] Search/filter by email or display name (debounced)
  - [ ] User table: avatar, name, email, role badge, project count, created date
  - [ ] Delete button with confirmation modal

- [ ] **Projects Tab**
  - [ ] Search/filter by project name or owner (debounced)
  - [ ] Project cards: name, owner, camera count, collaborator count, created date
  - [ ] View button (link to project) and Delete button with confirmation modal

- [ ] **Invite History Tab**
  - [ ] List all generated invites
  - [ ] Full invite URL with copy-to-clipboard button
  - [ ] Expiry countdown with visual progress bar
  - [ ] Exact expiration timestamps

- [ ] **Delete Confirmation Modal**
  - [ ] Show item name in confirmation text
  - [ ] Cancel and Confirm Delete buttons
  - [ ] Handle both user and project deletion

- [ ] **UX & States**
  - [ ] Loading states on all async operations
  - [ ] Error toast on failed operations
  - [ ] Responsive layout (mobile, tablet, desktop)

---

## Milestone 5 — Route & Navigation

- [ ] Create `packages/frontend/src/pages/AdminPage.tsx`
  - [ ] Import `useAuth` hook
  - [ ] Redirect non-admins to `/` on mount
  - [ ] Render `<AdminDashboard />` for admins only

- [ ] Add route to router config
  - [ ] Path: `/admin/manage`
  - [ ] Mark as protected (requires authentication)

- [ ] Add admin-only nav link
  - [ ] Show link only when `user.system_role === 'admin'`

---

## Milestone 6 — Testing

- [ ] Test invite generation end-to-end
- [ ] Test delete user (with and without confirmation)
- [ ] Test delete project (with and without confirmation)
- [ ] Test search/filter for users and projects
- [ ] Test token expiry countdown display
- [ ] Test non-admin access is blocked (redirect)
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test error states (API failures, network errors)

---

## Milestone 7 — Final Review

- [ ] CSRF protection verified on POST/DELETE requests
- [ ] Input validation confirmed server-side for email and IDs
- [ ] No admin actions accessible to non-admin roles
- [ ] Console free of errors and warnings
- [ ] Performance check: search debounce working, no unnecessary re-renders
