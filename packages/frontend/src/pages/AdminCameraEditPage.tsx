import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authSlice'
import { useAdminCameraEdit } from '../features/admin-cameras/hooks/useAdminCameraEdit'
import CameraEditForm from '../features/admin-cameras/component/CameraEditForm'

export default function AdminCameraEditPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const editProps = useAdminCameraEdit()
  const { isNew, isLoading } = editProps

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true })
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="px-10 py-8 text-gray-400 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-10 py-8 max-w-3xl">
        <Link
          to="/admin/manage/cameras"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Camera Models
        </Link>

        <h1 className="text-[26px] font-bold text-gray-900 m-0 mb-8">
          {isNew ? 'Add Camera Model' : 'Edit Camera Model'}
        </h1>

        <CameraEditForm {...editProps} />
      </div>
    </div>
  )
}
