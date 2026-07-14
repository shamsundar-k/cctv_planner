import { useMemo, useState } from 'react'
import type { CameraSpecRecord } from '@/types/camera'
import CameraCard from './CameraCard/CameraCard'
import CameraSearchBar from './CameraSearchBar'
import DeleteConfirmModal from './CameraForm/DeleteConfirmModal'
import { useCameraModelDelete } from '../hooks/useCameraModelDelete'

const SEARCH_FIELDS: (keyof Pick<CameraSpecRecord, 'name' | 'manufacturer' | 'model'>)[] = [
  'name',
  'manufacturer',
  'model',
]

interface Props {
  cameras: CameraSpecRecord[]
  isLoading: boolean
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5" aria-label="Loading camera specifications">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-panel-border bg-panel p-5">
          <div className="mb-4 h-40 rounded-lg bg-divider" />
          <div className="mb-3 h-5 w-3/5 rounded bg-divider" />
          <div className="mb-2 h-3.5 w-4/5 rounded bg-divider" />
          <div className="mb-5 h-3.5 w-2/5 rounded bg-divider" />
          <div className="h-8 rounded bg-divider" />
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
        <div className="rounded-xl border border-dashed border-panel-border bg-panel/60 px-6 py-20 text-center text-sm text-text-muted">
          {searchTerm ? 'No camera specifications match your search.' : 'No camera specifications yet. Add the first one.'}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
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
