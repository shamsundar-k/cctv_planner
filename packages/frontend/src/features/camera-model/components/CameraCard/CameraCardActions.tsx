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
        className="flex-1 rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5 text-center text-xs font-semibold text-primary no-underline transition-colors hover:border-primary/40 hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Edit
      </Link>
      <button
        onClick={() => onDelete(camera)}
        className="flex-1 cursor-pointer rounded-md border border-error/35 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:border-error/60 hover:bg-error/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        Delete
      </button>
    </div>
  )
}
