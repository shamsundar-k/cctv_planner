/*
 * FILE SUMMARY — src/components/admin/utils.ts
 *
 * Pure formatting helper functions shared across admin UI components.
 *
 * formatDate(iso) — Accepts an ISO 8601 date string and returns a human-
 *   readable date formatted as "dd Mon yyyy" in en-GB locale (e.g.
 *   "21 Mar 2026"). Used in UsersTab, ProjectsTab, and InvitesTab.
 *
 * getInitials(name) — Accepts a full name string, splits on spaces, takes the
 *   first character of each word, joins them, and returns the first 2
 *   characters uppercased (e.g. "John Doe" → "JD"). Used to render avatar
 *   initials in the user list.
 *
 * getExpiryPercent(expiresAt, createdAt) — Calculates how much of an invite's
 *   lifetime remains as a percentage (0–100). Returns 0 if already expired.
 *   Used by InvitesTab to drive the colour-coded progress bar.
 *
 * getExpiryLabel(expiresAt) — Returns a human-readable time-remaining string
 *   for an invite (e.g. "3h remaining", "2d remaining", "Expired"). Used as
 *   the badge label in InvitesTab.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getExpiryPercent(expiresAt: string, createdAt: string): number {
  const total = new Date(expiresAt).getTime() - new Date(createdAt).getTime()
  const remaining = new Date(expiresAt).getTime() - Date.now()
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

export function getExpiryLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const hours = Math.floor(ms / 3600000)
  if (hours < 1) {
    const mins = Math.floor(ms / 60000)
    return `${mins}m remaining`
  }
  if (hours < 24) return `${hours}h remaining`
  const days = Math.floor(hours / 24)
  return `${days}d remaining`
}
