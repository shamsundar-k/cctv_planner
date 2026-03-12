import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/authSlice'

export default function PublicOnlyRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return accessToken ? <Navigate to="/" replace /> : <Outlet />
}
