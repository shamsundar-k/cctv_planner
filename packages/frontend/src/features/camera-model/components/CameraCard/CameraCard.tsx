import type { CameraSpecRecord } from '@/types/camera'
import CameraSpecImage from '../CameraSpecImage'
import CameraCardHeader from './CameraCardHeader'
import CameraCardSpec from './CameraCardSpec'
import CameraCardActions from './CameraCardActions'

interface Props {
  camera: CameraSpecRecord
  onDelete: (camera: CameraSpecRecord) => void
}

export default function CameraCard({ camera, onDelete }: Props) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-panel-border bg-panel p-5 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <CameraSpecImage camera={camera} className="h-40 rounded-lg" />

      <CameraCardHeader camera={camera} />

      {/* Specs */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <CameraCardSpec.Type camera={camera} />
        <CameraCardSpec.Resolution camera={camera} />
        <CameraCardSpec.HorizontalFOV camera={camera} />
        <CameraCardSpec.FocalLength camera={camera} />
        <CameraCardSpec.IRRange camera={camera} />
      </div>

      <CameraCardActions camera={camera} onDelete={onDelete} />
    </article>
  )
}
