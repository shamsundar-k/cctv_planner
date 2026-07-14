import type { CameraSpecRecord } from '@/types/camera'

const lensTypeMap: Record<string, string> = {
  fixed: 'Fixed',
  varifocal: 'Varifocal',
}

export default function CameraCardHeader({ camera }: { camera: CameraSpecRecord }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="m-0 truncate text-sm font-semibold text-text-primary">{camera.name}</h3>
        <p className="m-0 mt-0.5 truncate text-xs text-text-muted">
          {[camera.manufacturer, camera.model].filter(Boolean).join(' - ') || '—'}
        </p>
      </div>
      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
        {lensTypeMap[camera.lens_spec.lens_type] ?? camera.lens_spec.lens_type}
      </span>
    </div>
  )
}
