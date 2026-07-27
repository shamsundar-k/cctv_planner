import { useEffect } from 'react'
import { Check, Loader2, Save } from 'lucide-react'
import { useSaveAction } from '@/features/map-view/hooks/useSaveAction'

interface WorkspaceSaveButtonProps {
  projectId: string
}

export default function WorkspaceSaveButton({ projectId }: WorkspaceSaveButtonProps) {
  const { isDirty, isSaving, handleSave } = useSaveAction(projectId)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return
      event.preventDefault()
      if (isDirty && !isSaving) void handleSave()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, isDirty, isSaving])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const label = isSaving ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'

  return (
    <button
      type="button"
      onClick={() => void handleSave()}
      disabled={!isDirty || isSaving}
      title={isDirty ? 'Save all camera changes (Ctrl/Cmd + S)' : 'All camera changes are saved'}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        isDirty || isSaving
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary-hover disabled:border-primary disabled:bg-primary disabled:text-primary-foreground'
          : 'border-panel-border bg-background text-text-muted'
      } disabled:cursor-default`}
      aria-label={label}
    >
      {isSaving ? (
        <Loader2 size={14} className="animate-spin" aria-hidden />
      ) : isDirty ? (
        <Save size={14} aria-hidden />
      ) : (
        <Check size={14} aria-hidden />
      )}
      <span aria-live="polite">{label}</span>
    </button>
  )
}
