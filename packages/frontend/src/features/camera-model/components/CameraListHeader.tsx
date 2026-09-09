import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Upload } from 'lucide-react'
import CameraImportDialog from './CameraImportDialog'

export default function CameraListHeader() {
  const [importOpen, setImportOpen] = useState(false)

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 border-b border-divider pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-text-primary sm:text-[28px]">
            Camera Specifications
          </h1>
          <p className="mb-0 mt-1.5 text-sm text-text-muted">
            Manage the camera models available to CCTV projects.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Upload size={16} aria-hidden="true" />
            Import Camera Specification
          </button>
          <Link
            to="/admin/manage/camera_specs/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground no-underline shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus size={16} aria-hidden="true" />
            Add Camera Specification
          </Link>
        </div>
      </div>
      {importOpen && <CameraImportDialog onClose={() => setImportOpen(false)} />}
    </>
  )
}
