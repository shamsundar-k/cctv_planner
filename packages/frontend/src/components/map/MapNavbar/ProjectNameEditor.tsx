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
        className="text-sm text-slate-200 font-medium bg-slate-700 border border-blue-500 rounded px-2 py-0.5 max-w-xs outline-none"
        aria-label="Project name"
      />
    )
  }

  return (
    <span
      className="text-sm text-slate-200 font-medium truncate max-w-xs cursor-text hover:text-white"
      onClick={onStartEditing}
      title="Click to rename"
    >
      {displayName}
    </span>
  )
}
