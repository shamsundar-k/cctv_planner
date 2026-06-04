import { Link } from 'react-router'
import type { CameraSpecRecord } from '@/types/camera'

interface Props {
  camera: CameraSpecRecord
  onDelete: (camera: CameraSpecRecord) => void
}

export default function CameraCardActions({ camera, onDelete }: Props) {
  return (
    <div className="flex gap-2 mt-auto pt-1">
      <Link
        to={`/admin/manage/camera_specs/${camera.id}`}
        className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-surface hover:bg-accent/20 text-primary rounded-md no-underline transition-colors"
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
  )
}
