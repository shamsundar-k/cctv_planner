import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/authSlice'

export default function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
