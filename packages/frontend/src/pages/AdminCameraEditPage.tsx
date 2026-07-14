import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import Navbar from '../features/navigation/component/Navbar'
import { useAdminCameraEdit } from '../features/camera-model/hooks/useAdminCameraEdit'
import CameraEditForm from '../features/camera-model/components/CameraForm/CameraEditForm'

export default function AdminCameraEditPage() {
  const { isLoading, ...formProps } = useAdminCameraEdit()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10"><div className="h-5 w-48 animate-pulse rounded bg-divider" /><div className="mt-7 h-8 w-72 max-w-full animate-pulse rounded bg-divider" /><div className="mt-8 h-32 animate-pulse rounded-xl border border-panel-border bg-panel" /></main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <Link
          to="/admin/manage/camera_specs"
          className="mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-text-muted no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ChevronLeft size={16} />
          Camera Specifications
        </Link>

        <div className="mb-8 border-b border-divider pb-6"><h1 className="m-0 text-2xl font-bold tracking-tight text-text-primary sm:text-[28px]">Edit Camera Specification</h1><p className="mb-0 mt-1.5 text-sm text-text-muted">Update camera identity, imaging, lens, sensor, and IR details.</p></div>

        <CameraEditForm {...formProps} />
      </main>
    </div>
  )
}
