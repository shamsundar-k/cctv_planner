/*
 * FILE SUMMARY — src/components/ProtectedRoute.tsx
 *
 * Route guard component for authenticated-only pages.
 *
 * ProtectedRoute() — Reads the `accessToken` from the Zustand auth store.
 *   - If no token is present (user is unauthenticated), renders a
 *     <Navigate to="/login" replace /> to redirect the user to the login page.
 *   - If a token is present, renders <Outlet /> to display the matched child
 *     route's component.
 *
 * Used in App.tsx to wrap all protected routes (dashboard, admin pages,
 * project management). Note: this is a client-side guard only; the backend
 * also enforces authentication on every API endpoint.
 */
import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/authSlice'

export default function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
