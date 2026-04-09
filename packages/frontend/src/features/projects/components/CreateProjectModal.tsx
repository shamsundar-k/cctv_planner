/*
 * FILE SUMMARY — src/features/projects/components/CreateProjectModal.tsx
 *
 * Modal dialog for creating a new CCTV survey project.
 *
 * CreateProjectModal({ onClose }) — Renders a fixed-overlay modal with a form
 *   containing the following fields:
 *   - Project Name (required, 1–100 characters).
 *   - Description (optional, max 500 characters with live character count).
 *   - Base Map Location (optional): Latitude (–90 to 90), Longitude (–180 to
 *     180), and Zoom level (1–22). All three are validated client-side.
 *
 * handleSubmit(e) — Validates all fields, then calls the useCreateProject
 *   mutation. On success, shows a "Project created successfully" toast and
 *   calls `onClose`. On failure, sets an inline error message and shows an
 *   error toast.
 *
 * inputCls(invalid) — Inline helper that returns the appropriate Tailwind
 *   input class string, with a red border when the field is invalid.
 *
 * The modal auto-focuses the name field on open. Pressing Escape closes it.
 * Clicking the backdrop (outside the dialog) also closes it.
 * The "Create Project" button is disabled until all validation passes and no
 * mutation is in flight.
 */
import { useEffect, useRef, useState } from 'react'
import { useCreateProject } from '../../../api/projects'
import { useToast } from '../../../components/ui/Toast'

interface CreateProjectModalProps {
  onClose: () => void
}

const inputCls = (invalid: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-primary bg-surface/10 placeholder-surface/50 outline-none transition-all ${
    invalid ? 'border-red-500 ring-1 ring-red-500/30' : 'border-surface/30 focus:border-primary/60 focus:ring-1 focus:ring-primary/20'
  }`

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
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-card/90 backdrop-blur-xl border border-surface/30 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] w-[600px] max-h-[90vh] overflow-y-auto flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface/20 bg-surface/5">
          <h2 id="create-modal-title" className="text-lg font-bold text-primary m-0">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-transparent border-none cursor-pointer text-xl text-muted/70 hover:text-primary leading-none transition-colors p-1 rounded-full hover:bg-surface/20"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Name */}
            <div>
              <label htmlFor="create-name" className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5">
                Project Name <span className="text-accent normal-case tracking-normal">*</span>
              </label>
              <input
                ref={nameRef}
                id="create-name"
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Parking Lot – Downtown"
                className={inputCls(name.length > 0 && !nameValid)}
              />
              <span className="text-xs text-muted/60 mt-1 block">1–100 characters (required)</span>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="create-desc" className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5">
                Description <span className="text-surface/60 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="create-desc"
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the survey project..."
                rows={3}
                className="w-full px-3 py-2.5 border border-surface/30 focus:border-primary/60 focus:ring-1 focus:ring-primary/20 rounded-xl text-sm text-primary bg-surface/10 placeholder-surface/50 outline-none transition-all resize-y font-[inherit] leading-relaxed"
              />
              <span className="text-xs text-muted/60 mt-1 block">{description.length}/500 characters</span>
            </div>

            {/* Base Map Location */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1">
                Base Map Location <span className="text-surface/60 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <span className="text-xs text-muted/60 block mb-2.5">
                Set the initial map view when this project is opened
              </span>
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label htmlFor="create-lat" className="text-xs text-muted/70 font-bold uppercase tracking-wider block mb-1">Latitude</label>
                  <input
                    id="create-lat"
                    type="number"
                    value={lat}
                    step="any"
                    min="-90"
                    max="90"
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="40.7128"
                    className={inputCls(lat !== '' && !latValid)}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="create-lng" className="text-xs text-muted/70 font-bold uppercase tracking-wider block mb-1">Longitude</label>
                  <input
                    id="create-lng"
                    type="number"
                    value={lng}
                    step="any"
                    min="-180"
                    max="180"
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-74.0060"
                    className={inputCls(lng !== '' && !lngValid)}
                  />
                </div>
                <div className="w-[90px]">
                  <label htmlFor="create-zoom" className="text-xs text-muted/70 font-bold uppercase tracking-wider block mb-1">Zoom (1–22)</label>
                  <input
                    id="create-zoom"
                    type="number"
                    value={zoom}
                    min="1"
                    max="22"
                    onChange={(e) => setZoom(e.target.value)}
                    className={inputCls(!zoomValid)}
                  />
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-300/80 m-0 bg-red-900/20 border border-red-500/30 rounded-xl px-3 py-2">{submitError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface/20 bg-surface/5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 bg-surface/15 hover:bg-surface/30 text-primary/80 border border-surface/30 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`h-9 px-5 border-none rounded-lg text-sm font-bold transition-all ${
                canSubmit
                  ? 'bg-accent hover:bg-accent-hover hover:text-card text-on-accent cursor-pointer shadow-md shadow-accent/20'
                  : 'bg-surface/20 text-surface/40 cursor-not-allowed'
              }`}
            >
              {isPending ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
