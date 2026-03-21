/*
 * FILE SUMMARY — src/components/admin/Spinner.tsx
 *
 * Minimal inline loading spinner for use inside buttons and other inline
 * contexts.
 *
 * Spinner() — Renders a small circular CSS-animated spinner as a <span>
 *   element. Uses Tailwind classes: `animate-spin`, rounded border with a
 *   white top-border for the spinning arc, and `inline-block` so it can sit
 *   next to button text without breaking layout. Size is 14 × 14 px.
 *
 * Used in OverviewTab (Generate Invite button) and DeleteModal (confirm
 * button) to indicate pending mutation state.
 */
export default function Spinner() {
  return (
    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin align-middle" />
  )
}
