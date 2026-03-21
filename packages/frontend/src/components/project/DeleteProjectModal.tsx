/*
 * FILE SUMMARY — src/components/project/DeleteProjectModal.tsx
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
import { useDeleteProject, type Project } from '../../api/projects'
import { useToast } from '../ui/Toast'

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
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-[560px] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <h2 id="delete-modal-title" className="text-lg font-bold text-slate-100 m-0">
            Delete Project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-transparent border-none cursor-pointer text-xl text-slate-400 hover:text-slate-200 leading-none transition-colors"
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
              <p className="text-sm font-semibold text-slate-100 m-0 mb-1">
                Permanently delete &ldquo;{project.name}&rdquo;?
              </p>
              <p className="text-sm text-slate-400 m-0 leading-relaxed">
                This action cannot be undone. All cameras, zones, and reports associated with this
                project will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label
              htmlFor="delete-confirm"
              className="text-sm text-slate-300 block mb-2 leading-relaxed"
            >
              Type the project name to confirm:{' '}
              <strong className="text-slate-100">{project.name}</strong>
            </label>
            <input
              ref={inputRef}
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={project.name}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDelete() }}
              className={`w-full px-3 py-2 border rounded-md text-sm text-slate-100 bg-slate-700 placeholder-slate-500 outline-none transition-colors ${
                confirmText.length > 0 && !confirmed
                  ? 'border-red-500'
                  : 'border-slate-600 focus:border-blue-500'
              }`}
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-400 m-0">{submitError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="h-9 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-md text-sm font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className={`h-9 px-5 border-none rounded-md text-sm font-semibold text-white transition-colors ${
              canDelete ? 'bg-red-600 hover:bg-red-700 cursor-pointer' : 'bg-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            {isPending ? 'Deleting…' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
