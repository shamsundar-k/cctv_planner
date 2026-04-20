import type { CameraModel } from '@/types/cameramodel.types'
import CameraCardHeader from './CameraCardHeader'
import CameraCardSpec from './CameraCardSpec'
import CameraCardActions from './CameraCardActions'

interface Props {
  camera: CameraModel
  onDelete: (camera: CameraModel) => void
}

export default function CameraCard({ camera, onDelete }: Props) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      <CameraCardHeader camera={camera} />

      {/* Specs */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <CameraCardSpec.Type camera={camera} />
        <CameraCardSpec.Resolution camera={camera} />
        <CameraCardSpec.HorizontalFOV camera={camera} />
        <CameraCardSpec.FocalLength camera={camera} />
        <CameraCardSpec.IRRange camera={camera} />
      </div>

      {camera.notes && (
        <p className="text-xs text-slate-500 italic m-0 line-clamp-2">{camera.notes}</p>
      )}

      <CameraCardActions camera={camera} onDelete={onDelete} />
    </div>
  )
}
