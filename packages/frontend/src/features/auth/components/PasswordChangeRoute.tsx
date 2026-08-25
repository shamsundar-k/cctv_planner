import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../stores/authStore'

export default function PasswordChangeRoute() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const mustChangePassword = useAuthStore(
    (state) => state.user?.mustChangePassword,
  )

  if (!accessToken) return <Navigate to="/login" replace />
  if (!mustChangePassword) return <Navigate to="/" replace />
  return <Outlet />
}
