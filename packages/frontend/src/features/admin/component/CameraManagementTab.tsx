import { Link } from 'react-router'
import { Camera, ChevronRight } from 'lucide-react'

interface CameraManagementTabProps {
  totalCameraModels: number
}

export default function CameraManagementTab({ totalCameraModels }: CameraManagementTabProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      <div className="rounded-lg border border-panel-border bg-panel p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 mt-0 text-base font-bold text-text-primary">CCTV Camera Management</h2>
            <p className="m-0 text-sm text-text-secondary">Add, edit, and manage the camera specification catalogue.</p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Camera size={20} aria-hidden />
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-lg border border-panel-border bg-background px-4 py-3">
          <span className="text-sm text-text-secondary">Available Camera Models</span>
          <span className="text-lg font-bold text-text-primary">{totalCameraModels}</span>
        </div>

        <Link
          to="/admin/manage/camera_specs"
          className="flex w-full items-center justify-between rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-text-primary no-underline transition-colors hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="text-sm font-semibold">Manage Camera Specifications</span>
          <ChevronRight size={16} className="shrink-0 text-primary" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
