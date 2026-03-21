/*
 * FILE SUMMARY — src/components/PublicOnlyRoute.tsx
 *
 * Route guard component for pages that should only be accessible to
 * unauthenticated users (e.g., login and invite-acceptance pages).
 *
 * PublicOnlyRoute() — Reads the `accessToken` from the Zustand auth store.
 *   - If a token is present (user is already logged in), renders a
 *     <Navigate to="/" replace /> to redirect the user to the dashboard,
 *     preventing them from seeing the login or accept-invite pages again.
 *   - If no token is present, renders <Outlet /> to display the matched child
 *     route's component (LoginPage or AcceptInvitePage).
 */
import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/authSlice'

export default function PublicOnlyRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return accessToken ? <Navigate to="/" replace /> : <Outlet />
}
