import { useEffect, useRef, useState } from 'react'
import { useUpdateProject, type Project } from '../../api/projects'
import { useToast } from '../ui/Toast'

interface EditProjectModalProps {
  project: Project
  onClose: () => void
}

const inputCls = (invalid: boolean) =>
  `w-full px-3 py-2 border rounded-md text-sm text-slate-100 bg-slate-700 placeholder-slate-500 outline-none transition-colors ${
    invalid ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
  }`

export default function EditProjectModal({ project, onClose }: EditProjectModalProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [lat, setLat] = useState(project.center_lat !== null ? String(project.center_lat) : '')
  const [lng, setLng] = useState(project.center_lng !== null ? String(project.center_lng) : '')
  const [zoom, setZoom] = useState(project.default_zoom !== null ? String(project.default_zoom) : '15')
  const [submitError, setSubmitError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: updateProject, isPending } = useUpdateProject()
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

  const hasLocation = lat !== '' && lng !== ''

  const origLat = project.center_lat !== null ? String(project.center_lat) : ''
  const origLng = project.center_lng !== null ? String(project.center_lng) : ''
  const origZoom = project.default_zoom !== null ? String(project.default_zoom) : '15'

  const isDirty =
    name.trim() !== project.name ||
    description !== (project.description ?? '') ||
    lat !== origLat ||
    lng !== origLng ||
    zoom !== origZoom

  const canSubmit = nameValid && descValid && latValid && lngValid && zoomValid && isDirty && !isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError('')
    try {
      await updateProject({
        projectId: project.id,
        updates: {
          name: name.trim(),
          description: description.trim() || undefined,
          center_lat: latNum,
          center_lng: lngNum,
          default_zoom: hasLocation ? zoomNum : null,
        },
      })
      showToast('Project updated successfully', 'success')
      onClose()
    } catch {
      setSubmitError('Failed to save changes. Please try again.')
      showToast('Failed to update project', 'error')
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
        aria-labelledby="edit-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <h2 id="edit-modal-title" className="text-lg font-bold text-slate-100 m-0">
            Edit Project
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
              <label htmlFor="edit-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={nameRef}
                id="edit-name"
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                className={inputCls(name.length > 0 && !nameValid)}
              />
              <span className="text-xs text-slate-500 mt-1 block">1–100 characters (required)</span>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-desc" className="block text-sm font-medium text-slate-300 mb-1.5">
                Description <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <textarea
                id="edit-desc"
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
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
                  <label htmlFor="edit-lat" className="text-xs text-slate-500 block mb-1">Latitude</label>
                  <input
                    id="edit-lat"
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
                  <label htmlFor="edit-lng" className="text-xs text-slate-500 block mb-1">Longitude</label>
                  <input
                    id="edit-lng"
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
                  <label htmlFor="edit-zoom" className="text-xs text-slate-500 block mb-1">Zoom (1–22)</label>
                  <input
                    id="edit-zoom"
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
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
