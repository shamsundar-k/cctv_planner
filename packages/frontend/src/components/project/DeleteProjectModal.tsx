import { useEffect, useRef, useState } from 'react'
import { useDeleteProject, type Project } from '../../api/projects'
import { useToast } from '../ui/Toast'

interface DeleteProjectModalProps {
  project: Project
  onClose: () => void
}

const OVERLAY: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200,
}

const MODAL: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 8,
  boxShadow: '0 20px 25px rgba(0,0,0,0.2)',
  width: 560,
  display: 'flex',
  flexDirection: 'column',
}

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d0d0d0',
  borderRadius: 6,
  fontSize: 14,
  color: '#1a1a1a',
  background: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
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
    <div style={OVERLAY} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={MODAL} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <h2 id="delete-modal-title" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Delete Project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Warning */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: '#fff8f0',
              border: '1px solid #ffcc88',
              borderRadius: 6,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 2L2 21h20L12 2z" fill="#ff9900" />
              <path d="M12 9v5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="#ffffff" />
            </svg>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
                Permanently delete &ldquo;{project.name}&rdquo;?
              </p>
              <p style={{ fontSize: 14, color: '#666666', margin: 0, lineHeight: 1.6 }}>
                This action cannot be undone. All cameras, zones, and reports associated with this
                project will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label
              htmlFor="delete-confirm"
              style={{ fontSize: 14, color: '#1a1a1a', display: 'block', marginBottom: 8, lineHeight: 1.6 }}
            >
              Type the project name to confirm:{' '}
              <strong>{project.name}</strong>
            </label>
            <input
              ref={inputRef}
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={project.name}
              style={{
                ...INPUT,
                borderColor: confirmText.length > 0 && !confirmed ? '#dd0000' : '#d0d0d0',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  confirmText.length > 0 && !confirmed ? '#dd0000' : '#d0d0d0')
              }
              onKeyDown={(e) => { if (e.key === 'Enter') handleDelete() }}
            />
          </div>

          {submitError && (
            <p style={{ fontSize: 14, color: '#dd0000', margin: 0 }}>{submitError}</p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            padding: '16px 24px',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: 36,
              padding: '0 16px',
              background: '#ffffff',
              color: '#1a1a1a',
              border: '1px solid #d0d0d0',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            style={{
              height: 36,
              padding: '0 20px',
              background: canDelete ? '#dd0000' : '#cccccc',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: canDelete ? 'pointer' : 'not-allowed',
            }}
          >
            {isPending ? 'Deleting…' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
