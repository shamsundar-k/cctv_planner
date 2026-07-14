import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import Navbar from '../features/navigation/component/Navbar'
import { useCameraSpecList } from '../features/camera-model/hooks/useCameraModelList'
import CameraListHeader from '../features/camera-model/components/CameraListHeader'
import CameraGrid from '../features/camera-model/components/CameraGrid'

export default function AdminCamerasPage() {
  const { cameras, isLoading } = useCameraSpecList()

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <Link
          to="/admin/manage"
          className="mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-text-muted no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ChevronLeft size={16} />
          Admin Dashboard
        </Link>

        <CameraListHeader />
        <CameraGrid cameras={cameras} isLoading={isLoading} />
      </main>
    </div>
  )
}
