import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../store/authSlice'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useUpdateProject } from '../../api/projects'
import { useToast } from '../ui/Toast'
import UserMenu from '../layout/UserMenu'

interface MapNavbarProps {
  projectId: string
  projectName: string
  onSave?: () => Promise<void>
}

function formatRelativeTime(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin === 1) return '1 min ago'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr === 1) return '1 hr ago'
  return `${diffHr} hr ago`
}

export default function MapNavbar({ projectId, projectName, onSave }: MapNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(projectName)
  const [draftName, setDraftName] = useState(projectName)
  const [isSaving, setIsSaving] = useState(false)
  // tick forces re-render every 30 s so relative timestamp stays fresh
  const [, setTick] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const escapeRef = useRef(false)

  const user = useAuthStore((s) => s.user)
  const { isDirty, lastSavedAt, markSaved } = useMapViewStore()
  const updateProject = useUpdateProject()
  const showToast = useToast()

  let initials = '??'
  if (user?.fullName) {
    initials = user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  } else if (user?.email) {
    initials = user.email[0].toUpperCase()
  }

  // Keep displayName in sync with server-fetched projectName (but not while editing)
  useEffect(() => {
    if (!isEditing) setDisplayName(projectName)
  }, [projectName, isEditing])

  // Focus + select all when edit mode starts
  useEffect(() => {
    if (isEditing) inputRef.current?.select()
  }, [isEditing])

  // Refresh relative timestamp every 30 s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  function startEditing() {
    setDraftName(displayName)
    escapeRef.current = false
    setIsEditing(true)
  }

  async function commitEdit() {
    if (escapeRef.current) {
      setIsEditing(false)
      return
    }
    const trimmed = draftName.trim()
    if (!trimmed || trimmed.length > 100) {
      showToast('Project name must be 1–100 characters.', 'error')
      setIsEditing(false)
      return
    }
    if (trimmed === displayName) {
      setIsEditing(false)
      return
    }
    try {
      await updateProject.mutateAsync({ projectId, updates: { name: trimmed } })
      setDisplayName(trimmed)
      setIsEditing(false)
    } catch {
      showToast('Failed to update project name.', 'error')
      setIsEditing(false)
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      escapeRef.current = true
      inputRef.current?.blur()
    }
  }

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await onSave?.()
      markSaved()
    } catch {
      showToast('Save failed. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSave, markSaved, showToast])

  return (
    <header className="h-12 shrink-0 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3 relative z-[2000]">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="7" width="14" height="10" rx="2" fill="#60a5fa" />
          <path d="M16 10l5-3v10l-5-3V10z" fill="#60a5fa" />
          <circle cx="9" cy="12" r="2" fill="#ffffff" />
        </svg>
        <span className="text-sm font-bold text-slate-100 whitespace-nowrap">CCTV Planner</span>
      </div>

      <div className="w-px h-5 bg-slate-600 shrink-0" />

      {/* Project name — inline editable */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleInputKeyDown}
          maxLength={100}
          className="text-sm text-slate-200 font-medium bg-slate-700 border border-blue-500 rounded px-2 py-0.5 max-w-xs outline-none"
          aria-label="Project name"
        />
      ) : (
        <span
          className="text-sm text-slate-200 font-medium truncate max-w-xs cursor-text hover:text-white"
          onClick={startEditing}
          title="Click to rename"
        >
          {displayName}
        </span>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="relative flex flex-col items-center justify-center px-3 py-1 min-w-[72px] h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white rounded-md border-none cursor-pointer transition-colors leading-tight"
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
            <span className="text-blue-200 font-normal leading-none" style={{ fontSize: 10 }}>
              {formatRelativeTime(lastSavedAt)}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
            className="w-8 h-8 rounded-full bg-blue-600 text-white text-[13px] font-semibold flex items-center justify-center cursor-pointer border-none select-none"
          >
            {initials}
          </button>
          {menuOpen && (
            <UserMenu
              onClose={() => setMenuOpen(false)}
              exitProjectPath="/"
            />
          )}
        </div>
      </div>
    </header>
  )
}
