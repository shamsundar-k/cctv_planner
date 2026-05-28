import { Link } from 'react-router'
import { Plus } from 'lucide-react'

export default function CameraListHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[28px] font-bold text-primary m-0">Camera Specifications</h1>
        <p className="text-sm text-muted mt-1.5 mb-0">
          Camera specification catalogue
        </p>
      </div>
      <Link
        to="/admin/manage/camera_specs/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-on-accent text-sm font-semibold rounded-lg no-underline transition-colors"
      >
        <Plus size={16} />
        Add Camera Specification
      </Link>
    </div>
  )
}
