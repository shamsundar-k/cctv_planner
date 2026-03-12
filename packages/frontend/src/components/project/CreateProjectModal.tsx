import { useEffect, useRef, useState } from 'react'
import { useCreateProject } from '../../api/projects'
import { useToast } from '../ui/Toast'

interface CreateProjectModalProps {
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

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [zoom, setZoom] = useState('15')
  const [submitError, setSubmitError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: createProject, isPending } = useCreateProject()
  const showToast = useToast()

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
  const latNum = lat !== '' ? parseFloat(lat) : null
  const lngNum = lng !== '' ? parseFloat(lng) : null
  const zoomNum = zoom !== '' ? parseInt(zoom, 10) : 15
  const latValid = lat === '' || (!isNaN(latNum!) && latNum! >= -90 && latNum! <= 90)
  const lngValid = lng === '' || (!isNaN(lngNum!) && lngNum! >= -180 && lngNum! <= 180)
  const zoomValid = !isNaN(zoomNum) && zoomNum >= 1 && zoomNum <= 22
  const canSubmit = nameValid && descValid && latValid && lngValid && zoomValid && !isPending

  const hasLocation = lat !== '' && lng !== ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError('')
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        center_lat: latNum,
        center_lng: lngNum,
        default_zoom: hasLocation ? zoomNum : null,
      })
      showToast('Project created successfully', 'success')
      onClose()
    } catch {
      setSubmitError('Failed to create project. Please try again.')
      showToast('Failed to create project', 'error')
    }
  }

  return (
    <div style={OVERLAY} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={MODAL} role="dialog" aria-modal="true" aria-labelledby="create-modal-title">
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
          <h2 id="create-modal-title" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Create New Project
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
              <label htmlFor="create-name" style={LABEL}>
                Project Name <span style={{ color: '#dd0000' }}>*</span>
              </label>
              <input
                ref={nameRef}
                id="create-name"
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Parking Lot – Downtown"
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
              <label htmlFor="create-desc" style={LABEL}>
                Description <span style={{ color: '#777777', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="create-desc"
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the survey project..."
                rows={3}
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

            {/* Base Map Location */}
            <div>
              <label style={{ ...LABEL, fontSize: 14, marginBottom: 4 }}>
                Base Map Location <span style={{ color: '#777777', fontWeight: 400 }}>(optional)</span>
              </label>
              <span style={{ ...HINT, display: 'block', marginBottom: 10, marginTop: 0 }}>
                Set the initial map view when this project is opened
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="create-lat" style={{ ...HINT, display: 'block', marginBottom: 4, marginTop: 0 }}>Latitude</label>
                  <input
                    id="create-lat"
                    type="number"
                    value={lat}
                    step="any"
                    min="-90"
                    max="90"
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="40.7128"
                    style={{
                      ...INPUT,
                      borderColor: lat !== '' && !latValid ? '#dd0000' : '#d0d0d0',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = lat !== '' && !latValid ? '#dd0000' : '#d0d0d0')}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="create-lng" style={{ ...HINT, display: 'block', marginBottom: 4, marginTop: 0 }}>Longitude</label>
                  <input
                    id="create-lng"
                    type="number"
                    value={lng}
                    step="any"
                    min="-180"
                    max="180"
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-74.0060"
                    style={{
                      ...INPUT,
                      borderColor: lng !== '' && !lngValid ? '#dd0000' : '#d0d0d0',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = lng !== '' && !lngValid ? '#dd0000' : '#d0d0d0')}
                  />
                </div>
                <div style={{ width: 90 }}>
                  <label htmlFor="create-zoom" style={{ ...HINT, display: 'block', marginBottom: 4, marginTop: 0 }}>Zoom (1–22)</label>
                  <input
                    id="create-zoom"
                    type="number"
                    value={zoom}
                    min="1"
                    max="22"
                    onChange={(e) => setZoom(e.target.value)}
                    style={{
                      ...INPUT,
                      borderColor: !zoomValid ? '#dd0000' : '#d0d0d0',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = !zoomValid ? '#dd0000' : '#d0d0d0')}
                  />
                </div>
              </div>
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
              {isPending ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
