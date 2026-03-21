/*
 * FILE SUMMARY — src/components/admin/types.ts
 *
 * Shared TypeScript type definitions for the admin dashboard.
 *
 * Tab — Union type of the four valid admin tab identifiers:
 *   'overview' | 'users' | 'projects' | 'invites'. Used by AdminDashboard to
 *   track the active tab and by each tab component's props interface.
 *
 * DeleteModalState — A discriminated union describing whether the delete/
 *   revoke confirmation modal is open or closed:
 *   - { open: false } — modal is hidden.
 *   - { open: true; type: 'user' | 'project' | 'invite'; id: string;
 *       name: string } — modal is visible, targeting a specific entity. The
 *     `type` field controls the modal copy, and `id`/`name` are passed to the
 *     mutation on confirmation.
 */
export type Tab = 'overview' | 'users' | 'projects' | 'invites'

export type DeleteModalState =
  | { open: false }
  | { open: true; type: 'user' | 'project' | 'invite'; id: string; name: string }
