import { Link } from 'react-router'
import type { CameraModel } from '../../../api/cameramodel.types'
import CameraTypeLabel from './CameraTypeLabel'
import LensTypeBadge from './LensTypeBadge'

interface Props {
  camera: CameraModel
  onDelete: (camera: CameraModel) => void
}

export default function CameraCard({ camera, onDelete }: Props) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 m-0 truncate">{camera.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 m-0 truncate">
            {[camera.manufacturer, camera.model_number].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        <LensTypeBadge type={camera.lens_type} />
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-slate-500">Type</span>
        <span className="text-slate-300">
          <CameraTypeLabel type={camera.camera_type} />
        </span>

        <span className="text-slate-500">Resolution</span>
        <span className="text-slate-300">
          {camera.resolution_h}×{camera.resolution_v} ({camera.megapixels}MP)
        </span>

        <span className="text-slate-500">H-FOV</span>
        <span className="text-slate-300">
          {camera.h_fov_min === camera.h_fov_max
            ? `${camera.h_fov_min}°`
            : `${camera.h_fov_min}°–${camera.h_fov_max}°`}
        </span>

        <span className="text-slate-500">Focal length</span>
        <span className="text-slate-300">
          {camera.focal_length_min === camera.focal_length_max
            ? `${camera.focal_length_min} mm`
            : `${camera.focal_length_min}–${camera.focal_length_max} mm`}
        </span>

        {camera.ir_range > 0 && (
          <>
            <span className="text-slate-500">IR range</span>
            <span className="text-slate-300">{camera.ir_range} m</span>
          </>
        )}
      </div>

      {camera.notes && (
        <p className="text-xs text-slate-500 italic m-0 line-clamp-2">{camera.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link
          to={`/admin/manage/cameras/${camera.id}`}
          className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md no-underline transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(camera)}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-transparent text-red-500 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500 rounded-md cursor-pointer transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
