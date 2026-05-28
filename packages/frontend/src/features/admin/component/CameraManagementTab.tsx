import { Link } from 'react-router'
import { Camera, ChevronRight } from 'lucide-react'

interface CameraManagementTabProps {
  totalCameraModels: number
}

export default function CameraManagementTab({ totalCameraModels }: CameraManagementTabProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      <div
        className="rounded-xl p-6"
        style={{
          background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)',
          border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold mt-0 mb-1" style={{ color: 'var(--theme-text-primary)' }}>
              CCTV Camera Management
            </h2>
            <p className="text-sm m-0" style={{ color: 'var(--theme-text-secondary)' }}>
              Add, edit, and manage the camera specification catalogue.
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
          >
            <Camera size={20} style={{ color: 'var(--theme-accent)' }} aria-hidden="true" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-lg px-4 py-3 mb-5"
          style={{
            background: 'color-mix(in srgb, var(--theme-surface) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--theme-surface) 24%, transparent)',
          }}
        >
          <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            Available Camera Models
          </span>
          <span className="text-lg font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            {totalCameraModels}
          </span>
        </div>

        <Link
          to="/admin/manage/camera_specs"
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg no-underline transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--theme-accent) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--theme-accent) 25%, transparent)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 20%, transparent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 10%, transparent)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            Manage Camera Specifications
          </span>
          <ChevronRight size={16} style={{ color: 'var(--theme-accent)', flexShrink: 0 }} />
        </Link>
      </div>
    </div>
  )
}
