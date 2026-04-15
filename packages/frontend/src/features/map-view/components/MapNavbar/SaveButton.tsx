function formatRelativeTime(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin === 1) return '1 min ago'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr === 1) return '1 hr ago'
  return `${diffHr} hr ago`
}

interface SaveButtonProps {
  isSaving: boolean
  isDirty: boolean
  lastSavedAt: Date | null
  onClick: () => void
}

export function SaveButton({ isSaving, isDirty, lastSavedAt, onClick }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isSaving}
      className="relative flex flex-col items-center justify-center px-3 py-1 min-w-[72px] h-8 text-xs font-bold border-none rounded-md cursor-pointer transition-all leading-tight disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }}
      onMouseEnter={e => { if (!isSaving) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-base)' } }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-accent-text)' }}
      title={isDirty ? 'Unsaved changes' : lastSavedAt ? `Saved ${formatRelativeTime(lastSavedAt)}` : 'Save'}
    >
      {/* Unsaved dot */}
      {isDirty && !isSaving && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" aria-label="Unsaved changes" />
      )}

      <span className="flex items-center gap-1">
        {isSaving ? (
          <>
            <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving…
          </>
        ) : (
          'Save'
        )}
      </span>

      {lastSavedAt && !isSaving && (
        <span className="font-normal leading-none opacity-70" style={{ fontSize: 10 }}>
          {formatRelativeTime(lastSavedAt)}
        </span>
      )}
    </button>
  )
}
