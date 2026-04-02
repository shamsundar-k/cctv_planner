interface ProjectNameEditorProps {
  displayName: string
  draftName: string
  isEditing: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onStartEditing: () => void
  onDraftChange: (name: string) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function ProjectNameEditor({
  displayName,
  draftName,
  isEditing,
  inputRef,
  onStartEditing,
  onDraftChange,
  onBlur,
  onKeyDown,
}: ProjectNameEditorProps) {
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draftName}
        onChange={(e) => onDraftChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        maxLength={100}
        className="text-sm font-medium max-w-xs outline-none rounded px-2 py-0.5"
        style={{
          color: 'var(--theme-text-primary)',
          background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
          border: '1px solid var(--theme-accent)',
        }}
        aria-label="Project name"
      />
    )
  }

  return (
    <span
      className="text-sm font-medium truncate max-w-xs cursor-text transition-colors"
      style={{ color: 'color-mix(in srgb, var(--theme-text-primary) 85%, transparent)' }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-text-primary)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-primary) 85%, transparent)')}
      onClick={onStartEditing}
      title="Click to rename"
    >
      {displayName}
    </span>
  )
}

