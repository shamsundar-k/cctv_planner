import { useMemo, useState } from 'react'
import type { CameraModel } from '@/types/cameramodel.types'
import CameraCard from './CameraCard/CameraCard'
import CameraSearchBar from './CameraSearchBar'
import DeleteConfirmModal from './CameraForm/DeleteConfirmModal'
import { useCameraModelDelete } from '../hooks/useCameraModelDelete'

const SEARCH_FIELDS: (keyof CameraModel)[] = ['name', 'manufacturer', 'model_number']

interface Props {
  cameras: CameraModel[]
  isLoading: boolean
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

export default function CameraGrid({ cameras, isLoading }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const { deleteTarget, setDeleteTarget, handleDelete, isDeleting } = useCameraModelDelete()

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return cameras
    return cameras.filter((camera) =>
      SEARCH_FIELDS.some((field) => String(camera[field]).toLowerCase().includes(q)),
    )
  }, [cameras, searchTerm])

  return (
    <>
      <CameraSearchBar
        search={searchTerm}
        onSearch={setSearchTerm}
        count={filtered.length}
        isLoading={isLoading}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          {searchTerm ? 'No camera models match your search.' : 'No camera models yet. Add the first one.'}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {filtered.map((camera) => (
            <CameraCard key={camera.id} camera={camera} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          camera={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}

