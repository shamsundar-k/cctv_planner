import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import Navbar from '../features/navigation/component/Navbar'
import { useCameraModelList } from '../features/camera-model/hooks/useCameraModelList'
import CameraListHeader from '../features/camera-model/components/CameraListHeader'
import CameraGrid from '../features/camera-model/components/CameraGrid'

export default function AdminCamerasPage() {
  const { cameras, isLoading } = useCameraModelList()

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="px-10 py-8">
        <Link
          to="/admin/manage"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4 no-underline"
        >
          <ChevronLeft size={16} />
          Admin Dashboard
        </Link>

        <CameraListHeader />
        <CameraGrid cameras={cameras} isLoading={isLoading} />
      </div>
    </div>
  )
}

