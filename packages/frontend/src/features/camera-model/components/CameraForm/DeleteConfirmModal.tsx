import type { CameraSpecRecord } from '@/types/camera'

interface Props {
  camera: CameraSpecRecord
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

export default function DeleteConfirmModal({ camera, onConfirm, onCancel, isDeleting }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-base font-semibold text-primary m-0 mb-2">Delete Camera Specification</h2>
        <p className="text-sm text-muted mb-5">
          Are you sure you want to delete{' '}
          <span className="text-primary font-medium">"{camera.name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-surface hover:bg-border text-primary rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
