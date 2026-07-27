import { Trash2 } from 'lucide-react'
import { useCameraStore } from '@/store/cameraStore'

interface PanelFooterProps {
  confirmDelete: boolean
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export default function PanelFooter({ confirmDelete, onRequestDelete, onConfirmDelete, onCancelDelete }: PanelFooterProps) {
  const isDirty = useCameraStore((state) => state.getIsDirty())
  const isSaving = useCameraStore((state) => state.uids.some(
    (uid) => state.cameraRecords[uid]?.tracking.status === 'saving',
  ))

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-panel-border px-4 py-2">
      {!confirmDelete ? (
        <>
          <p className={`text-[10px] font-medium ${isDirty ? 'text-warning' : 'text-text-muted'}`}>
            {isSaving ? 'Saving changes…' : isDirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          <button
            type="button"
            onClick={onRequestDelete}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-panel-border bg-background px-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-error/50 hover:bg-error/5 hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <Trash2 size={12} aria-hidden />
            Delete
          </button>
        </>
      ) : (
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-error">Delete this camera?</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onCancelDelete}
              className="h-7 rounded-md border border-panel-border bg-background px-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:bg-divider/60 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              className="h-7 rounded-md border border-error bg-error px-2.5 text-[11px] font-semibold text-error-foreground transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
