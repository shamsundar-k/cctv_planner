interface PanelFooterProps {
  confirmDelete: boolean
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export default function PanelFooter({ confirmDelete, onRequestDelete, onConfirmDelete, onCancelDelete }: PanelFooterProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-panel-border px-4 py-3">
      <p className="text-center text-[10px] text-text-muted">Changes are saved from the Project panel</p>
      {!confirmDelete ? (
        <button
          type="button"
          onClick={onRequestDelete}
          className="h-8 rounded-md text-xs font-medium text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
        >
          Delete Camera
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onConfirmDelete}
            className="h-8 flex-1 rounded-md border border-error bg-error text-xs font-bold text-error-foreground transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            Confirm Delete
          </button>
          <button
            type="button"
            onClick={onCancelDelete}
            className="h-8 flex-1 rounded-md border border-panel-border bg-background text-xs font-medium text-text-secondary transition-colors hover:bg-divider/60 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
