import { useEffect, useRef, useState } from 'react'
import { useUpdateProject, type Project } from '../../api/projects'

interface EditProjectModalProps {
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
  width: 600,
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
}

const LABEL: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: '#1a1a1a',
  marginBottom: 6,
  display: 'block',
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

const HINT: React.CSSProperties = {
  fontSize: 12,
  color: '#777777',
  marginTop: 4,
}

export default function EditProjectModal({ project, onClose }: EditProjectModalProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [submitError, setSubmitError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: updateProject, isPending } = useUpdateProject()

  useEffect(() => {
    nameRef.current?.focus()
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const nameValid = name.trim().length >= 1 && name.trim().length <= 100
  const descValid = description.length <= 500
  const isDirty = name.trim() !== project.name || description !== (project.description ?? '')
  const canSubmit = nameValid && descValid && isDirty && !isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError('')
    try {
      await updateProject({
        projectId: project.id,
        updates: { name: name.trim(), description: description.trim() || undefined },
      })
      onClose()
    } catch {
      setSubmitError('Failed to save changes. Please try again.')
    }
  }

  return (
    <div style={OVERLAY} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={MODAL} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
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
          <h2 id="edit-modal-title" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Edit Project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name */}
            <div>
              <label htmlFor="edit-name" style={LABEL}>
                Project Name <span style={{ color: '#dd0000' }}>*</span>
              </label>
              <input
                ref={nameRef}
                id="edit-name"
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                style={{
                  ...INPUT,
                  borderColor: name.length > 0 && !nameValid ? '#dd0000' : '#d0d0d0',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
                onBlur={(e) => (e.currentTarget.style.borderColor = name.length > 0 && !nameValid ? '#dd0000' : '#d0d0d0')}
              />
              <span style={HINT}>1–100 characters (required)</span>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-desc" style={LABEL}>
                Description <span style={{ color: '#777777', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="edit-desc"
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{
                  ...INPUT,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#d0d0d0')}
              />
              <span style={HINT}>{description.length}/500 characters</span>
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
              type="button"
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
              type="submit"
              disabled={!canSubmit}
              style={{
                height: 36,
                padding: '0 20px',
                background: canSubmit ? '#0066cc' : '#cccccc',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
