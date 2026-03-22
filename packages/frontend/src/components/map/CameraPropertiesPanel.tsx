import { useEffect, useState } from 'react'
import {
  useCameraInstances,
  useUpdateCameraInstance,
  useDeleteCameraInstance,
} from '../../api/cameraInstances'
import { useImportedCameras } from '../../api/projects'
import { useMapViewStore } from '../../store/mapViewSlice'

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormValues {
  label: string
  colour: string
  height: number
  bearing: number
  tilt_angle: number
  target_distance: number | ''
  target_height: number
  focal_length_chosen: number | ''
}

// ── Helper components ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xs text-slate-300 truncate">{value}</p>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  )
}

const inputCls =
  'bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-xs px-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500'

// ── Main component ─────────────────────────────────────────────────────────────

interface CameraPropertiesPanelProps {
  projectId: string
}

export default function CameraPropertiesPanel({ projectId }: CameraPropertiesPanelProps) {
  const selectedCameraId = useMapViewStore((s) => s.selectedCameraId)
  const setSelectedCamera = useMapViewStore((s) => s.setSelectedCamera)

  const { data: cameras } = useCameraInstances(projectId)
  const { data: importedItems } = useImportedCameras(projectId)

  const updateCamera = useUpdateCameraInstance(projectId)
  const deleteCamera = useDeleteCameraInstance(projectId)

  const camera = cameras?.find((c) => c.id === selectedCameraId) ?? null
  const cameraModel = importedItems?.find(
    (item) => item.camera_model.id === camera?.camera_model_id,
  )?.camera_model ?? null

  const [form, setForm] = useState<FormValues | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Initialise form when selection changes (not on every refetch)
  useEffect(() => {
    if (!camera) {
      setForm(null)
      return
    }
    setForm({
      label: camera.label,
      colour: camera.colour,
      height: camera.height,
      bearing: camera.bearing,
      tilt_angle: camera.tilt_angle,
      target_distance: camera.target_distance ?? '',
      target_height: camera.target_height,
      focal_length_chosen: camera.focal_length_chosen ?? '',
    })
    setConfirmDelete(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera?.id])

  // Auto-deselect if selected camera was removed from the list
  useEffect(() => {
    if (selectedCameraId && cameras && !cameras.find((c) => c.id === selectedCameraId)) {
      setSelectedCamera(null)
    }
  }, [cameras, selectedCameraId, setSelectedCamera])

  // Escape key closes the panel
  useEffect(() => {
    if (!selectedCameraId) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCamera(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedCameraId, setSelectedCamera])

  // Dirty check
  const isDirty =
    form !== null &&
    camera !== null &&
    (form.label !== camera.label ||
      form.colour !== camera.colour ||
      form.height !== camera.height ||
      form.bearing !== camera.bearing ||
      form.tilt_angle !== camera.tilt_angle ||
      (form.target_distance === '' ? null : form.target_distance) !== camera.target_distance ||
      form.target_height !== camera.target_height ||
      (form.focal_length_chosen === '' ? null : form.focal_length_chosen) !==
        camera.focal_length_chosen)

  function handleSave() {
    if (!form || !camera) return
    updateCamera.mutate(
      {
        cameraId: camera.id,
        data: {
          label: form.label,
          colour: form.colour,
          height: form.height,
          bearing: form.bearing,
          tilt_angle: form.tilt_angle,
          target_distance: form.target_distance === '' ? null : form.target_distance,
          target_height: form.target_height,
          focal_length_chosen: form.focal_length_chosen === '' ? null : form.focal_length_chosen,
        },
      },
      {
        onSuccess: (updated) => {
          setForm({
            label: updated.label,
            colour: updated.colour,
            height: updated.height,
            bearing: updated.bearing,
            tilt_angle: updated.tilt_angle,
            target_distance: updated.target_distance ?? '',
            target_height: updated.target_height,
            focal_length_chosen: updated.focal_length_chosen ?? '',
          })
        },
      },
    )
  }

  function handleDelete() {
    if (!camera) return
    deleteCamera.mutate(camera.id, {
      onSuccess: () => setSelectedCamera(null),
    })
  }

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
  }

  function parseNullableNumber(raw: string): number | '' {
    if (raw === '') return ''
    const n = parseFloat(raw)
    return isNaN(n) ? '' : n
  }

  return (
    <aside
      className="shrink-0 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden transition-[width] duration-200"
      style={{ width: selectedCameraId ? 312 : 0 }}
      aria-hidden={!selectedCameraId}
    >
      {selectedCameraId && form && camera && (
        <div className="flex flex-col h-full w-[312px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
            <h2 className="text-sm font-semibold text-slate-100">Camera Properties</h2>
            <button
              onClick={() => setSelectedCamera(null)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Read-only info */}
          <section className="px-4 py-3 border-b border-slate-700 shrink-0 flex flex-col gap-2">
            <ReadOnlyField label="Model" value={cameraModel?.name ?? '—'} />
            <ReadOnlyField
              label="Position"
              value={`${camera.lat.toFixed(6)}, ${camera.lng.toFixed(6)}`}
            />
          </section>

          {/* Editable fields */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
            <FormField label="Label">
              <input
                type="text"
                value={form.label}
                onChange={(e) => setField('label', e.target.value)}
                placeholder="e.g. Entrance Camera"
                className={inputCls}
              />
            </FormField>

            <FormField label="Colour">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.colour}
                  onChange={(e) => setField('colour', e.target.value)}
                  className="w-8 h-8 cursor-pointer rounded border border-slate-600 bg-transparent p-0.5 shrink-0"
                />
                <input
                  type="text"
                  value={form.colour}
                  onChange={(e) => setField('colour', e.target.value)}
                  maxLength={7}
                  className={inputCls}
                />
              </div>
            </FormField>

            <FormField label="Height above ground (m)">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={form.height}
                onChange={(e) => setField('height', parseFloat(e.target.value) || 0.1)}
                className={inputCls}
              />
            </FormField>

            <FormField label="Bearing (°)">
              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={form.bearing}
                  onChange={(e) => setField('bearing', parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <input
                  type="number"
                  min={0}
                  max={360}
                  step={1}
                  value={form.bearing}
                  onChange={(e) => setField('bearing', parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
              </div>
            </FormField>

            <FormField label="Tilt Angle (°)">
              <input
                type="number"
                min={0}
                max={90}
                step={1}
                value={form.tilt_angle}
                onChange={(e) => setField('tilt_angle', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </FormField>

            <FormField label="Target Distance (m)">
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.target_distance}
                onChange={(e) => setField('target_distance', parseNullableNumber(e.target.value))}
                placeholder="Auto"
                className={inputCls}
              />
            </FormField>

            <FormField label="Target Height (m)">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={form.target_height}
                onChange={(e) => setField('target_height', parseFloat(e.target.value) || 0.1)}
                className={inputCls}
              />
            </FormField>

            <FormField label="Focal Length (mm)">
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.focal_length_chosen}
                onChange={(e) =>
                  setField('focal_length_chosen', parseNullableNumber(e.target.value))
                }
                placeholder="Auto"
                className={inputCls}
              />
            </FormField>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-700 flex flex-col gap-2 shrink-0">
            <button
              onClick={handleSave}
              disabled={!isDirty || updateCamera.isPending}
              className="h-8 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {updateCamera.isPending ? 'Saving…' : 'Save Changes'}
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="h-8 rounded-md text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
              >
                Delete Camera
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteCamera.isPending}
                  className="flex-1 h-8 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors disabled:opacity-40"
                >
                  {deleteCamera.isPending ? 'Deleting…' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-8 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
