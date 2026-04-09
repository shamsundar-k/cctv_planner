/*
 * FILE SUMMARY — src/pages/AdminPage.tsx
 *
 * Route-level admin guard page rendered at /admin/manage. Ensures only admin
 * users can access the admin dashboard.
 *
 * AdminPage() — Reads the current user from the Zustand auth store.
 *   - On mount (and whenever the user changes), redirects non-admin users to /
 *     using useNavigate with replace:true, preventing back-navigation to the
 *     admin page.
 *   - Returns null during the redirect to avoid a flash of admin content for
 *     non-admin users.
 *   - For admin users, renders a full-screen container with <Navbar> and
 *     <AdminDashboard>.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../store/authSlice'
import Navbar from '../components/layout/Navbar'
import AdminDashboard from '../features/admin/component/AdminDashboard'

export default function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      <AdminDashboard />
    </div>
  )
}
