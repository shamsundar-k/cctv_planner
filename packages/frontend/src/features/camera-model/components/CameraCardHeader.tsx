import type { CameraModel } from '@/types/cameramodel.types'


const lensTypeMap: Record<string, string> = {
  fixed: 'Fixed',
  varifocal: 'Varifocal',
}

export default function CameraCardHeader({ camera }: {camera: CameraModel})
 {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-100 m-0 truncate">{camera.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5 m-0 truncate">
          {[camera.manufacturer, camera.model_number].filter(Boolean).join(' - ') || '—'}
        </p>
      </div>
      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-700 text-slate-300">
        {lensTypeMap[camera.lens_type] ?? camera.lens_type}
      </span>
    </div>
  )
}
