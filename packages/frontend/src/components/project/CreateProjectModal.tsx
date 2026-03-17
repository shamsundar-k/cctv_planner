import { useEffect, useRef, useState } from 'react'
import { useCreateProject } from '../../api/projects'
import { useToast } from '../ui/Toast'

interface CreateProjectModalProps {
  onClose: () => void
}

const inputCls = (invalid: boolean) =>
  `w-full px-3 py-2 border rounded-md text-sm text-slate-100 bg-slate-700 placeholder-slate-500 outline-none transition-colors ${
    invalid ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
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
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <h2 id="create-modal-title" className="text-lg font-bold text-slate-100 m-0">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-transparent border-none cursor-pointer text-xl text-slate-400 hover:text-slate-200 leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Name */}
            <div>
              <label htmlFor="create-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Project Name <span className="text-red-400">*</span>
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
              <span className="text-xs text-slate-500 mt-1 block">1–100 characters (required)</span>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="create-desc" className="block text-sm font-medium text-slate-300 mb-1.5">
                Description <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <textarea
                id="create-desc"
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the survey project..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-600 focus:border-blue-500 rounded-md text-sm text-slate-100 bg-slate-700 placeholder-slate-500 outline-none transition-colors resize-y font-[inherit] leading-relaxed"
              />
              <span className="text-xs text-slate-500 mt-1 block">{description.length}/500 characters</span>
            </div>

            {/* Base Map Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Base Map Location <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <span className="text-xs text-slate-500 block mb-2.5">
                Set the initial map view when this project is opened
              </span>
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label htmlFor="create-lat" className="text-xs text-slate-500 block mb-1">Latitude</label>
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
                  <label htmlFor="create-lng" className="text-xs text-slate-500 block mb-1">Longitude</label>
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
                  <label htmlFor="create-zoom" className="text-xs text-slate-500 block mb-1">Zoom (1–22)</label>
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
              <p className="text-sm text-red-400 m-0">{submitError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-md text-sm font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`h-9 px-5 border-none rounded-md text-sm font-semibold text-white transition-colors ${
                canSubmit ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-slate-600 cursor-not-allowed opacity-50'
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
