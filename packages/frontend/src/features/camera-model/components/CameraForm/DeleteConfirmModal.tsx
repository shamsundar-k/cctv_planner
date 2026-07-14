import type { CameraSpecRecord } from '@/types/camera'

interface Props {
  camera: CameraSpecRecord
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

export default function DeleteConfirmModal({ camera, onConfirm, onCancel, isDeleting }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="presentation">
      <div className="w-full max-w-sm rounded-xl border border-panel-border bg-panel p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="delete-camera-title">
        <h2 id="delete-camera-title" className="m-0 mb-2 text-base font-semibold text-text-primary">Delete Camera Specification</h2>
        <p className="mb-5 text-sm text-text-muted">
          Are you sure you want to delete{' '}
          <span className="font-medium text-text-primary">"{camera.name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg border border-panel-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-divider disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg border border-error bg-error px-4 py-2 text-sm font-semibold text-error-foreground transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
