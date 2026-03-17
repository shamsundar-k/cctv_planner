import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../store/authSlice'
import Navbar from '../components/layout/Navbar'
import AdminDashboard from '../components/admin/AdminDashboard'

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
