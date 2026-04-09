/*
 * FILE SUMMARY — src/features/projects/components/DeleteProjectModal.tsx
 *
 * Confirmation modal for permanently deleting a project. Requires the user to
 * type the project name exactly before the delete action is enabled.
 *
 * DeleteProjectModal({ project, onClose }) — Renders a fixed-overlay modal
 *   with:
 *   - An amber warning banner explaining that all cameras, zones, and reports
 *     associated with the project will be permanently deleted.
 *   - A text input that the user must fill with the exact project name. The
 *     input border turns red when the typed text does not match.
 *   - A "Delete Project" button (red) that is disabled until the confirmation
 *     text matches the project name and no mutation is pending.
 *   - A "Cancel" button and Escape key handler that call `onClose`.
 *   - Pressing Enter while focused on the confirmation input also triggers
 *     deletion when valid.
 *
 * handleDelete() — Calls the useDeleteProject mutation with `project.id`. On
 *   success, shows a toast and calls `onClose`. On failure, sets an inline
 *   error message and shows an error toast.
 */
import { useEffect, useRef, useState } from 'react'
import { useDeleteProject } from '../../../api/projects'
import type { Project } from '../../../api/projects.types'
import { useToast } from '../../../components/ui/Toast'

interface DeleteProjectModalProps {
  project: Project
  onClose: () => void
}

export default function DeleteProjectModal({ project, onClose }: DeleteProjectModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [submitError, setSubmitError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: deleteProject, isPending } = useDeleteProject()
  const showToast = useToast()

  useEffect(() => {
    inputRef.current?.focus()
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const confirmed = confirmText === project.name
  const canDelete = confirmed && !isPending

  async function handleDelete() {
    if (!canDelete) return
    setSubmitError('')
    try {
      await deleteProject(project.id)
      showToast(`"${project.name}" deleted`, 'success')
      onClose()
    } catch {
      setSubmitError('Failed to delete project. Please try again.')
      showToast('Failed to delete project', 'error')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-[560px] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 id="delete-modal-title" className="text-lg font-bold text-primary m-0">
            Delete Project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-transparent border-none cursor-pointer text-xl text-muted hover:text-primary leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          {/* Warning */}
          <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
              <path d="M12 2L2 21h20L12 2z" fill="#f59e0b" />
              <path d="M12 9v5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="#ffffff" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-primary m-0 mb-1">
                Permanently delete &ldquo;{project.name}&rdquo;?
              </p>
              <p className="text-sm text-muted m-0 leading-relaxed">
                This action cannot be undone. All cameras, zones, and reports associated with this
                project will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label
              htmlFor="delete-confirm"
              className="text-sm text-primary/80 block mb-2 leading-relaxed"
            >
              Type the project name to confirm:{' '}
              <strong className="text-primary">{project.name}</strong>
            </label>
            <input
              ref={inputRef}
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={project.name}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDelete() }}
              className={`w-full px-3 py-2 border rounded-md text-sm text-primary bg-surface/20 placeholder-muted/50 outline-none transition-colors ${
                confirmText.length > 0 && !confirmed
                  ? 'border-red-500'
                  : 'border-border focus:border-accent'
              }`}
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-400 m-0">{submitError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-9 px-4 bg-surface/20 hover:bg-surface/40 text-primary border border-border rounded-md text-sm font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className={`h-9 px-5 border-none rounded-md text-sm font-semibold text-white transition-colors ${
              canDelete ? 'bg-red-600 hover:bg-red-700 cursor-pointer' : 'bg-surface/30 cursor-not-allowed opacity-50'
            }`}
          >
            {isPending ? 'Deleting…' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
