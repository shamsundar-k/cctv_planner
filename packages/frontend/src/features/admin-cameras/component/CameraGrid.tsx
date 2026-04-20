import type { CameraModel } from '../../../types/cameramodel.types'
import CameraCard from './CameraCard'

interface Props {
  cameras: CameraModel[]
  isLoading: boolean
  search: string
  onDelete: (camera: CameraModel) => void
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 animate-pulse">
          <div className="h-5 bg-slate-700 rounded w-3/5 mb-3" />
          <div className="h-3.5 bg-slate-700 rounded w-4/5 mb-2" />
          <div className="h-3.5 bg-slate-700 rounded w-2/5 mb-5" />
          <div className="h-8 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function CameraGrid({ cameras, isLoading, search, onDelete }: Props) {
  if (isLoading) return <LoadingSkeleton />

  if (cameras.length === 0) {
    return (
      <div className="text-center py-20 text-slate-600">
        {search ? 'No camera models match your search.' : 'No camera models yet. Add the first one.'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} onDelete={onDelete} />
      ))}
    </div>
  )
}
