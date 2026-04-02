
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authSlice'
import type { CameraModelCreate } from '../api/cameramodel.types'
import { useToast } from '../components/ui/Toast'
import { SENSOR_FORMATS, isStandardSensorFormat } from '../constants/sensorFormats'
import { useCameraModel, useCreateCameraModel, useUpdateCameraModel } from '../api/camerasModels'

// ── Field helpers ────────────────────────────────────────────────────────────

const labelClass = 'block text-xs font-medium text-gray-500 mb-1'
const inputClass =
  'w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'
const selectClass =
  'w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200
        ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  )
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group ml-1 inline-flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 text-gray-400 cursor-help"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[11px] text-white
        bg-gray-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
      </span>
    </span>
  )
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
      >
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest m-0">{title}</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="p-5">{children}</div>}
    </section>
  )
}

function InputWithUnit({ unit, children }: { unit: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
        {unit}
      </span>
    </div>
  )
}

function Field({
  label,
  children,
  hint,
  tooltip,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  tooltip?: string
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1 mb-0">{hint}</p>}
    </div>
  )
}

// ── Auto-calculate helpers ────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function calcMegapixels(h: number, v: number): string {
  if (!h || !v) return '—'
  const mp = (h * v) / 1_000_000
  return mp < 1 ? mp.toFixed(2) : mp.toFixed(1)
}

function calcAspectRatio(h: number, v: number): string {
  if (!h || !v) return '—'
  const g = gcd(h, v)
  return `${h / g}:${v / g}`
}

// ── Default form state ────────────────────────────────────────────────────────

const emptyForm: CameraModelCreate = {
  name: '',
  manufacturer: '',
  model_number: '',
  camera_type: 'bullet',
  location: '',
  notes: '',
  focal_length_min: 4,
  focal_length_max: 4,
  h_fov_min: 90,
  h_fov_max: 90,
  v_fov_min: 55,
  v_fov_max: 55,
  lens_type: 'fixed',
  ir_cut_filter: true,
  ir_range: 0,
  resolution_h: 1920,
  resolution_v: 1080,
  sensor_size: null,
  sensor_type: 'cmos',
  min_illumination: 0,
  wdr: false,
  wdr_db: null,
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCameraEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const showToast = useToast()

  const { data: existing, isLoading } = useCameraModel(id ?? '')
  const createCamera = useCreateCameraModel()
  const updateCamera = useUpdateCameraModel()

  const [form, setForm] = useState<CameraModelCreate>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sensorIsCustom, setSensorIsCustom] = useState(false)

  useEffect(() => {
    if (existing) {
      const existingSensorSize = existing.sensor_size ?? null
      const isCustom = !!existingSensorSize && !isStandardSensorFormat(existingSensorSize)
      setSensorIsCustom(isCustom)
      setForm({
        name: existing.name,
        manufacturer: existing.manufacturer,
        model_number: existing.model_number,
        camera_type: existing.camera_type,
        location: existing.location,
        notes: existing.notes ?? '',
        focal_length_min: existing.focal_length_min,
        focal_length_max: existing.focal_length_max,
        h_fov_min: existing.h_fov_min,
        h_fov_max: existing.h_fov_max,
        v_fov_min: existing.v_fov_min,
        v_fov_max: existing.v_fov_max,
        lens_type: existing.lens_type,
        ir_cut_filter: existing.ir_cut_filter,
        ir_range: existing.ir_range,
        resolution_h: existing.resolution_h,
        resolution_v: existing.resolution_v,
        sensor_size: existingSensorSize,
        sensor_type: existing.sensor_type,
        min_illumination: existing.min_illumination,
        wdr: existing.wdr,
        wdr_db: existing.wdr_db ?? null,
      })
    }
  }, [existing])

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true })
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="px-10 py-8 text-gray-400 text-sm">Loading…</div>
      </div>
    )
  }

  function set<K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleLensTypeChange(lt: CameraModelCreate['lens_type']) {
    set('lens_type', lt)
    if (lt === 'fixed') {
      setForm((prev) => ({
        ...prev,
        lens_type: lt,
        focal_length_max: prev.focal_length_min,
        h_fov_max: prev.h_fov_min,
        v_fov_max: prev.v_fov_min,
      }))
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.focal_length_min <= 0) e.focal_length_min = 'Must be > 0'
    if (form.focal_length_max < form.focal_length_min) e.focal_length_max = 'Must be ≥ min focal length'
    if (form.h_fov_min <= 0 || form.h_fov_min >= 360) e.h_fov_min = 'Must be 0–360°'
    if (form.h_fov_max < form.h_fov_min) e.h_fov_max = 'Must be ≥ min H-FOV'
    if (form.v_fov_min <= 0 || form.v_fov_min >= 180) e.v_fov_min = 'Must be 0–180°'
    if (form.v_fov_max < form.v_fov_min) e.v_fov_max = 'Must be ≥ min V-FOV'
    if (form.resolution_h <= 0) e.resolution_h = 'Must be > 0'
    if (form.resolution_v <= 0) e.resolution_v = 'Must be > 0'
    if (form.lens_type === 'fixed') {
      if (form.focal_length_max !== form.focal_length_min) e.focal_length_max = 'Fixed lens: max must equal min'
      if (form.h_fov_max !== form.h_fov_min) e.h_fov_max = 'Fixed lens: max must equal min'
      if (form.v_fov_max !== form.v_fov_min) e.v_fov_max = 'Fixed lens: max must equal min'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: CameraModelCreate = {
      ...form,
      notes: form.notes || null,
      sensor_size: form.sensor_size || null,
      wdr_db: form.wdr ? form.wdr_db : null,
    }

    try {
      if (isNew) {
        await createCamera.mutateAsync(payload)
        showToast('Camera model created', 'success')
      } else {
        await updateCamera.mutateAsync({ id: id!, body: payload })
        showToast('Camera model updated', 'success')
      }
      navigate('/admin/manage/cameras')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to save camera model'
      showToast(typeof msg === 'string' ? msg : 'Failed to save camera model', 'error')
    }
  }

  const isPending = createCamera.isPending || updateCamera.isPending
  const isFixed = form.lens_type === 'fixed'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-10 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <Link
          to="/admin/manage/cameras"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Camera Models
        </Link>

        <h1 className="text-[26px] font-bold text-gray-900 m-0 mb-8">
          {isNew ? 'Add Camera Model' : 'Edit Camera Model'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ── Identity ───────────────────────────────────────────── */}
          <Section title="Identity">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name *">
                <input
                  className={`${inputClass} ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 mb-0">{errors.name}</p>}
              </Field>
              <Field label="Manufacturer">
                <input
                  className={inputClass}
                  value={form.manufacturer}
                  onChange={(e) => set('manufacturer', e.target.value)}
                  placeholder="Manufacturer"
                />
              </Field>
              <Field label="Model Number">
                <input
                  className={inputClass}
                  value={form.model_number}
                  onChange={(e) => set('model_number', e.target.value)}
                  placeholder="Model Number"
                />
              </Field>
              <Field label="Camera Type">
                <select
                  className={selectClass}
                  value={form.camera_type}
                  onChange={(e) => set('camera_type', e.target.value as CameraModelCreate['camera_type'])}
                >
                  <option value="bullet">Bullet</option>
                  <option value="fixed_dome">Fixed Dome</option>
                  <option value="ptz">PTZ</option>
                </select>
              </Field>
              <Field label="Location/Environment">
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Location/Environment"
                />
              </Field>
              <Field label="Notes">
                <input
                  className={inputClass}
                  value={form.notes ?? ''}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Notes"
                />
              </Field>
            </div>
          </Section>

          {/* ── Lens ───────────────────────────────────────────────── */}
          <Section title="Lens">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Lens Type">
                <select
                  className={selectClass}
                  value={form.lens_type}
                  onChange={(e) => handleLensTypeChange(e.target.value as CameraModelCreate['lens_type'])}
                >
                  <option value="fixed">Fixed</option>
                  <option value="varifocal">Varifocal</option>
                  <option value="optical_zoom">Optical Zoom</option>
                </select>
              </Field>

              <Field label="Focal Length Min">
                <InputWithUnit unit="mm">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    className={`${inputClass} pr-10 ${errors.focal_length_min ? 'border-red-400' : ''}`}
                    value={form.focal_length_min}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0
                      setForm((prev) => ({
                        ...prev,
                        focal_length_min: v,
                        focal_length_max: isFixed ? v : prev.focal_length_max,
                      }))
                    }}
                  />
                </InputWithUnit>
                {errors.focal_length_min && <p className="text-xs text-red-500 mt-1 mb-0">{errors.focal_length_min}</p>}
              </Field>

              <Field label={isFixed ? 'Focal Length Max — auto-synced' : 'Focal Length Max'}>
                <InputWithUnit unit="mm">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    disabled={isFixed}
                    className={`${inputClass} pr-10 ${errors.focal_length_max ? 'border-red-400' : ''} disabled:opacity-50 disabled:bg-gray-50`}
                    value={form.focal_length_max}
                    onChange={(e) => set('focal_length_max', parseFloat(e.target.value) || 0)}
                  />
                </InputWithUnit>
                {errors.focal_length_max && <p className="text-xs text-red-500 mt-1 mb-0">{errors.focal_length_max}</p>}
              </Field>

              <Field
                label="H-FOV Min"
                tooltip="Horizontal field of view — tele end is the narrowest angle"
                hint="Tele end (narrow)"
              >
                <InputWithUnit unit="°">
                  <input
                    type="number"
                    min={0.1}
                    max={359}
                    step={0.1}
                    className={`${inputClass} pr-8 ${errors.h_fov_min ? 'border-red-400' : ''}`}
                    value={form.h_fov_min}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0
                      setForm((prev) => ({
                        ...prev,
                        h_fov_min: v,
                        h_fov_max: isFixed ? v : prev.h_fov_max,
                      }))
                    }}
                  />
                </InputWithUnit>
                {errors.h_fov_min && <p className="text-xs text-red-500 mt-1 mb-0">{errors.h_fov_min}</p>}
              </Field>

              <Field
                label={isFixed ? 'H-FOV Max — auto-synced' : 'H-FOV Max'}
                tooltip="Horizontal field of view — wide end is the broadest angle"
                hint="Wide end"
              >
                <InputWithUnit unit="°">
                  <input
                    type="number"
                    min={0.1}
                    max={359}
                    step={0.1}
                    disabled={isFixed}
                    className={`${inputClass} pr-8 ${errors.h_fov_max ? 'border-red-400' : ''} disabled:opacity-50 disabled:bg-gray-50`}
                    value={form.h_fov_max}
                    onChange={(e) => set('h_fov_max', parseFloat(e.target.value) || 0)}
                  />
                </InputWithUnit>
                {errors.h_fov_max && <p className="text-xs text-red-500 mt-1 mb-0">{errors.h_fov_max}</p>}
              </Field>

              <Field
                label="V-FOV Min"
                tooltip="Vertical field of view — tele end is the narrowest angle"
                hint="Tele end (narrow)"
              >
                <InputWithUnit unit="°">
                  <input
                    type="number"
                    min={0.1}
                    max={179}
                    step={0.1}
                    className={`${inputClass} pr-8 ${errors.v_fov_min ? 'border-red-400' : ''}`}
                    value={form.v_fov_min}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0
                      setForm((prev) => ({
                        ...prev,
                        v_fov_min: v,
                        v_fov_max: isFixed ? v : prev.v_fov_max,
                      }))
                    }}
                  />
                </InputWithUnit>
                {errors.v_fov_min && <p className="text-xs text-red-500 mt-1 mb-0">{errors.v_fov_min}</p>}
              </Field>

              <Field
                label={isFixed ? 'V-FOV Max — auto-synced' : 'V-FOV Max'}
                tooltip="Vertical field of view — wide end is the broadest angle"
                hint="Wide end"
              >
                <InputWithUnit unit="°">
                  <input
                    type="number"
                    min={0.1}
                    max={179}
                    step={0.1}
                    disabled={isFixed}
                    className={`${inputClass} pr-8 ${errors.v_fov_max ? 'border-red-400' : ''} disabled:opacity-50 disabled:bg-gray-50`}
                    value={form.v_fov_max}
                    onChange={(e) => set('v_fov_max', parseFloat(e.target.value) || 0)}
                  />
                </InputWithUnit>
                {errors.v_fov_max && <p className="text-xs text-red-500 mt-1 mb-0">{errors.v_fov_max}</p>}
              </Field>

              <Field label="IR Cut Filter">
                <div className="flex items-center gap-3 h-9">
                  <Toggle checked={form.ir_cut_filter} onChange={(v) => set('ir_cut_filter', v)} />
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </Field>
            </div>
          </Section>

          {/* ── Sensor ─────────────────────────────────────────────── */}
          <Section title="Sensor">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Resolution H *">
                <InputWithUnit unit="px">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className={`${inputClass} pr-8 ${errors.resolution_h ? 'border-red-400' : ''}`}
                    value={form.resolution_h}
                    onChange={(e) => set('resolution_h', parseInt(e.target.value) || 0)}
                  />
                </InputWithUnit>
                {errors.resolution_h && <p className="text-xs text-red-500 mt-1 mb-0">{errors.resolution_h}</p>}
              </Field>

              <Field label="Resolution V *">
                <InputWithUnit unit="px">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className={`${inputClass} pr-8 ${errors.resolution_v ? 'border-red-400' : ''}`}
                    value={form.resolution_v}
                    onChange={(e) => set('resolution_v', parseInt(e.target.value) || 0)}
                  />
                </InputWithUnit>
                {errors.resolution_v && <p className="text-xs text-red-500 mt-1 mb-0">{errors.resolution_v}</p>}
              </Field>

              <Field label="Megapixels">
                <div className="h-9 px-3 flex items-center text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
                  {calcMegapixels(form.resolution_h, form.resolution_v)} MP
                </div>
              </Field>

              <Field label="Aspect Ratio">
                <div className="h-9 px-3 flex items-center text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
                  {calcAspectRatio(form.resolution_h, form.resolution_v)}
                </div>
              </Field>

              <Field label="Sensor Size" hint={
                !sensorIsCustom && form.sensor_size
                  ? `Physical width: ${SENSOR_FORMATS.find(f => f.format === form.sensor_size)?.widthMm} mm`
                  : undefined
              }>
                <select
                  className={selectClass}
                  value={sensorIsCustom ? 'Custom' : (form.sensor_size ?? '')}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === 'Custom') {
                      setSensorIsCustom(true)
                      set('sensor_size', null)
                    } else {
                      setSensorIsCustom(false)
                      set('sensor_size', val || null)
                    }
                  }}
                >
                  <option value="">— select format —</option>
                  {SENSOR_FORMATS.filter(f => f.format !== 'Custom').map(({ format, widthMm }) => (
                    <option key={format} value={format}>{format} ({widthMm} mm)</option>
                  ))}
                  <option value="Custom">Custom (enter width in mm)</option>
                </select>
                {sensorIsCustom && (
                  <input
                    className={`${inputClass} mt-2`}
                    value={form.sensor_size ?? ''}
                    onChange={(e) => set('sensor_size', e.target.value || null)}
                    placeholder="Enter sensor width in mm (e.g. 5.50)"
                  />
                )}
              </Field>

              <Field label="Sensor Type">
                <select
                  className={selectClass}
                  value={form.sensor_type}
                  onChange={(e) => set('sensor_type', e.target.value as CameraModelCreate['sensor_type'])}
                >
                  <option value="cmos">CMOS</option>
                </select>
              </Field>

              <Field label="Min Illumination" hint="0 = works in total darkness (IR)">
                <InputWithUnit unit="lux">
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    className={`${inputClass} pr-12`}
                    value={form.min_illumination}
                    onChange={(e) => set('min_illumination', parseFloat(e.target.value) || 0)}
                  />
                </InputWithUnit>
              </Field>
            </div>
          </Section>

          {/* ── Advanced ────────────────────────────────────────────── */}
          <Section title="Advanced" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="IR Range"
                tooltip="Effective IR illuminator range — 0 means no built-in IR"
                hint="0 = no IR illuminator"
              >
                <InputWithUnit unit="m">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className={`${inputClass} pr-8`}
                    value={form.ir_range}
                    onChange={(e) => set('ir_range', parseFloat(e.target.value) || 0)}
                  />
                </InputWithUnit>
              </Field>

              <Field label="WDR" tooltip="Wide Dynamic Range — improves image quality in high-contrast scenes">
                <div className="flex items-center gap-3 h-9">
                  <Toggle checked={form.wdr} onChange={(v) => set('wdr', v)} />
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </Field>

              {form.wdr && (
                <Field label="WDR Strength">
                  <InputWithUnit unit="dB">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      className={`${inputClass} pr-8`}
                      value={form.wdr_db ?? ''}
                      onChange={(e) => set('wdr_db', parseFloat(e.target.value) || null)}
                      placeholder="e.g. 120"
                    />
                  </InputWithUnit>
                </Field>
              )}
            </div>
          </Section>

          {/* ── Actions ────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2 border-t border-gray-200">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg border-none cursor-pointer transition-colors disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving…' : isNew ? 'Create Camera Model' : 'Save Changes'}
            </button>
            <Link
              to="/admin/manage/cameras"
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg no-underline transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
