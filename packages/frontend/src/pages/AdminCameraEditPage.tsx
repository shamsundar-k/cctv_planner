import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import Navbar from '../features/navigation/component/Navbar'
import { useAdminCameraEdit } from '../features/camera-model/hooks/useAdminCameraEdit'
import CameraEditForm from '../features/admin-cameras/component/CameraEditForm'

export default function AdminCameraEditPage() {
  const editProps = useAdminCameraEdit()
  const { isNew, isLoading } = editProps

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
          <ChevronLeft size={16} />
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
