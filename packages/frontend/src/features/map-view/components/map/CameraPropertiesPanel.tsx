import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useImportedCameras } from '../../../../api/projects'
import { useCameraStore } from '../../../../store/cameraStore'
import { useCameraLayerStore } from '../../../../store/cameraLayerSlice'
import type { Camera } from '../../../../types/camera.types'
import type { fov_input_params } from '../../../../lib/fovCalculations'
import { computeFovCartesian, computeFovGeoCorners } from '../../../../lib/fovCalculations'

interface FormValues {
  label: string
  colour: string
  camera_height: number
  bearing: number
  target_distance: number | ''
  target_height: number
  focal_length_chosen: number | ''
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{label}</p>
      <p className="text-xs truncate" style={{ color: 'var(--theme-text-primary)' }}>{value}</p>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--theme-text-secondary)' }}>{label}</p>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
  border: '1px solid color-mix(in srgb, var(--theme-surface) 35%, transparent)',
  color: 'var(--theme-text-primary)',
}
const inputCls = 'rounded-md text-xs px-2 py-1.5 w-full focus:outline-none'

function recomputeFov(
  form: FormValues,
  camera: Camera,
  cameraModel: { focal_length_min: number; focal_length_max: number; h_fov_min: number; h_fov_max: number; v_fov_min: number; v_fov_max: number; ir_range: number } | null,
) {
  if (!cameraModel || form.target_distance === '' || form.target_distance <= 0) return null

  const params: fov_input_params = {
    camera_height: form.camera_height,
    target_distance: form.target_distance,
    target_height: form.target_height,
    focal_length_min: cameraModel.focal_length_min,
    focal_length_max: cameraModel.focal_length_max,
    h_fov_wide: cameraModel.h_fov_max,
    h_fov_tele: cameraModel.h_fov_min,
    v_fov_wide: cameraModel.v_fov_max,
    v_fov_tele: cameraModel.v_fov_min,
    focal_length_chosen: form.focal_length_chosen !== '' ? form.focal_length_chosen : cameraModel.focal_length_min,
  }

  const result = computeFovCartesian(params)
  const geo_fov = computeFovGeoCorners(result, camera.lat, camera.lng, form.bearing)

  let ir_geo_fov = camera.fov_ir_geojson
  if (cameraModel.ir_range > 0) {
    const ir_result = computeFovCartesian({ ...params, target_distance: cameraModel.ir_range })
    ir_geo_fov = computeFovGeoCorners(ir_result, camera.lat, camera.lng, form.bearing)
  }

  return { result, geo_fov, ir_geo_fov }
}

interface CameraPropertiesPanelProps {
  projectId: string
}

export default function CameraPropertiesPanel({ projectId }: CameraPropertiesPanelProps) {
  const selectedCameraId = useCameraLayerStore((s) => s.selectedCameraId)
  const clearSelection = useCameraLayerStore((s) => s.clearSelection)

  const camera = useCameraStore((s) =>
    selectedCameraId ? s.cameraRecords[selectedCameraId]?.camera ?? null : null,
  )
  const uids = useCameraStore((s) => s.uids)
  const updateCamera = useCameraStore((s) => s.updateCamera)
  const removeCamera = useCameraStore((s) => s.removeCamera)
  const saveStatus = useCameraStore((s) =>
    selectedCameraId ? s.cameraRecords[selectedCameraId]?.tracking.status ?? null : null,
  )

  const { data: importedItems } = useImportedCameras(projectId)

  const cameraModel =
    importedItems?.find((item) => item.camera_model.id === camera?.camera_model_id)
      ?.camera_model ?? null

  const [form, setForm] = useState<FormValues | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!camera) { setForm(null); return }
    setForm({
      label: camera.label,
      colour: camera.colour,
      camera_height: camera.camera_height,
      bearing: camera.bearing,
      target_distance: camera.target_distance ?? '',
      target_height: camera.target_height,
      focal_length_chosen: camera.focal_length_chosen ?? '',
    })
    setConfirmDelete(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera?.uid])

  useEffect(() => {
    if (selectedCameraId && !uids.includes(selectedCameraId)) clearSelection()
  }, [uids, selectedCameraId, clearSelection])

  useEffect(() => {
    if (!selectedCameraId) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') clearSelection() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedCameraId, clearSelection])

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    if (!form || !camera || !selectedCameraId) return
    const next = { ...form, [key]: value }
    setForm(next)

    const patch: Partial<Camera> = { [key]: value }

    const fovFields: (keyof FormValues)[] = ['camera_height', 'target_distance', 'target_height', 'focal_length_chosen', 'bearing']
    if (fovFields.includes(key)) {
      const fovResult = recomputeFov(next, camera, cameraModel)
      if (fovResult) {
        patch.fov_visible_geojson = fovResult.geo_fov
        patch.tilt_angle = fovResult.result.tilt_angle
        patch.fov_ir_geojson = fovResult.ir_geo_fov
      }
    }

    updateCamera(selectedCameraId, patch)
  }

  function handleDelete() {
    if (!selectedCameraId) return
    removeCamera(selectedCameraId)
    clearSelection()
  }

  function parseNullableNumber(raw: string): number | '' {
    if (raw === '') return ''
    const n = parseFloat(raw)
    return isNaN(n) ? '' : n
  }

  return (
    <aside
      className="shrink-0 flex flex-col overflow-hidden transition-[width] duration-200"
      style={{
        width: selectedCameraId ? 312 : 0,
        background: 'var(--theme-bg-card)',
        borderLeft: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)',
      }}
      aria-hidden={!selectedCameraId}
    >
      {selectedCameraId && form && camera && (
        <div className="flex flex-col h-full w-[312px]">
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>Camera Properties</h2>
              {saveStatus === 'failed' && <span className="text-[10px] text-red-400 font-medium">Save failed</span>}
              {saveStatus === 'saving' && <span className="text-[10px] font-medium" style={{ color: 'var(--theme-accent)' }}>Saving…</span>}
            </div>
            <button
              onClick={() => clearSelection()}
              className="transition-colors p-1 rounded"
              style={{ color: 'var(--theme-text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-text-secondary)')}
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
          </div>

          <section
            className="px-4 py-3 border-b shrink-0 flex flex-col gap-2"
            style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', background: 'color-mix(in srgb, var(--theme-surface) 5%, transparent)' }}
          >
            <ReadOnlyField label="Model" value={cameraModel?.name ?? '—'} />
            <ReadOnlyField label="Position" value={`${camera.lat.toFixed(6)}, ${camera.lng.toFixed(6)}`} />
          </section>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
            <FormField label="Label">
              <input type="text" value={form.label} onChange={(e) => setField('label', e.target.value)} placeholder="e.g. Entrance Camera" className={inputCls} style={inputStyle} />
            </FormField>

            <FormField label="Colour">
              <div className="flex items-center gap-2">
                <input type="color" value={form.colour} onChange={(e) => setField('colour', e.target.value)} className="w-8 h-8 cursor-pointer rounded p-0.5 shrink-0" style={{ border: '1px solid color-mix(in srgb, var(--theme-surface) 35%, transparent)', background: 'transparent' }} />
                <input type="text" value={form.colour} onChange={(e) => setField('colour', e.target.value)} maxLength={7} className={inputCls} style={inputStyle} />
              </div>
            </FormField>

            <FormField label="Height above ground (m)">
              <input type="number" min={0.1} step={0.1} value={form.camera_height} onChange={(e) => setField('camera_height', parseFloat(e.target.value) || 0.1)} className={inputCls} style={inputStyle} />
            </FormField>

            <FormField label="Bearing (°)">
              <div className="flex flex-col gap-1">
                <input type="range" min={0} max={360} step={1} value={form.bearing} onChange={(e) => setField('bearing', parseInt(e.target.value))} className="w-full" style={{ accentColor: 'var(--theme-accent)' }} />
                <input type="number" min={0} max={360} step={1} value={form.bearing} onChange={(e) => setField('bearing', parseFloat(e.target.value) || 0)} className={inputCls} style={inputStyle} />
              </div>
            </FormField>

            <FormField label="Target Distance (m)">
              <input type="number" min={0} step={0.1} value={form.target_distance} onChange={(e) => setField('target_distance', parseNullableNumber(e.target.value))} placeholder="e.g. 50" className={inputCls} style={inputStyle} />
            </FormField>

            <FormField label="Target Height (m)">
              <input type="number" min={0.1} step={0.1} value={form.target_height} onChange={(e) => setField('target_height', parseFloat(e.target.value) || 0.1)} className={inputCls} style={inputStyle} />
            </FormField>

            {cameraModel && (
              <FormField label="Focal Length (mm)">
                <div className="flex flex-col gap-1">
                  <input type="range" min={cameraModel.focal_length_min} max={cameraModel.focal_length_max} step={0.1} value={form.focal_length_chosen !== '' ? form.focal_length_chosen : cameraModel.focal_length_min} onChange={(e) => setField('focal_length_chosen', parseFloat(e.target.value))} className="w-full" style={{ accentColor: 'var(--theme-accent)' }} />
                  <div className="flex justify-between text-[10px]" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}>
                    <span>{cameraModel.focal_length_min} mm</span>
                    <span>{cameraModel.focal_length_max} mm</span>
                  </div>
                  <input type="number" min={cameraModel.focal_length_min} max={cameraModel.focal_length_max} step={0.1} value={form.focal_length_chosen} onChange={(e) => setField('focal_length_chosen', parseNullableNumber(e.target.value))} placeholder="Auto" className={inputCls} style={inputStyle} />
                </div>
              </FormField>
            )}
          </div>

          <div
            className="px-4 py-3 border-t flex flex-col gap-2 shrink-0"
            style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
          >
            <p className="text-[10px] text-center" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>
              Changes are saved with the global Save button
            </p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="h-8 rounded-md text-xs font-medium transition-colors" style={{ color: 'var(--theme-accent)' }} onMouseEnter={e => (e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-accent) 70%, white)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-accent)')}>
                Delete Camera
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="flex-1 h-8 rounded-md text-xs font-bold transition-all border-none" style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-base)' }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-accent-text)' }}>
                  Confirm Delete
                </button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 h-8 rounded-md text-xs font-medium transition-colors border-none" style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', color: 'var(--theme-text-secondary)' }} onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 30%, transparent)')} onMouseLeave={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')}>
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
