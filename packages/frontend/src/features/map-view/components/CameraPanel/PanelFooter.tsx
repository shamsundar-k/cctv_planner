interface PanelFooterProps {
  confirmDelete: boolean
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export default function PanelFooter({ confirmDelete, onRequestDelete, onConfirmDelete, onCancelDelete }: PanelFooterProps) {
  return (
    <div
      className="px-4 py-3 border-t flex flex-col gap-2 shrink-0"
      style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
    >
      <p className="text-[10px] text-center" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>
        Changes are saved with the global Save button
      </p>
      {!confirmDelete ? (
        <button
          onClick={onRequestDelete}
          className="h-8 rounded-md text-xs font-medium transition-colors"
          style={{ color: 'var(--theme-accent)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-accent) 70%, white)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-accent)')}
        >
          Delete Camera
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onConfirmDelete}
            className="flex-1 h-8 rounded-md text-xs font-bold transition-all border-none"
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-base)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-accent-text)' }}
          >
            Confirm Delete
          </button>
          <button
            onClick={onCancelDelete}
            className="flex-1 h-8 rounded-md text-xs font-medium transition-colors border-none"
            style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', color: 'var(--theme-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 30%, transparent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
