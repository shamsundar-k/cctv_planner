import type { CameraModel } from '../../../api/cameramodel.types'

const map: Record<string, string> = {
  fixed: 'Fixed',
  varifocal: 'Varifocal',
  optical_zoom: 'Optical Zoom',
}

export default function LensTypeBadge({ type }: { type: CameraModel['lens_type'] }) {
  return (
    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-700 text-slate-300">
      {map[type] ?? type}
    </span>
  )
}
