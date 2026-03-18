import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authSlice'
import { useAdminCamera, useCreateCamera, useUpdateCamera, type CameraModelCreate } from '../api/cameras'
import { useToast } from '../components/ui/Toast'

// ── Field helpers ────────────────────────────────────────────────────────────

const labelClass = 'block text-xs font-medium text-slate-400 mb-1'
const inputClass =
  'w-full h-9 px-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors'
const selectClass =
  'w-full h-9 px-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500 transition-colors'

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-600 mt-1 mb-0">{hint}</p>}
    </div>
  )
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
  sensor_size: '',
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

  const { data: existing, isLoading } = useAdminCamera(id ?? '')
  const createCamera = useCreateCamera()
  const updateCamera = useUpdateCamera()

  const [form, setForm] = useState<CameraModelCreate>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing existing camera
  useEffect(() => {
    if (existing) {
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
        sensor_size: existing.sensor_size ?? '',
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
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="px-10 py-8 text-slate-500 text-sm">Loading…</div>
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

  // When lens type changes to fixed, sync max = min
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
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="px-10 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <Link
          to="/admin/manage/cameras"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Camera Models
        </Link>

        <h1 className="text-[26px] font-bold text-slate-100 m-0 mb-8">
          {isNew ? 'Add Camera Model' : 'Edit Camera Model'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* ── Identity ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 mt-0">Identity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Name *">
                  <input
                    className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Hikvision DS-2CD2143"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 mb-0">{errors.name}</p>}
                </Field>
              </div>
              <Field label="Manufacturer">
                <input className={inputClass} value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} placeholder="e.g. Hikvision" />
              </Field>
              <Field label="Model number">
                <input className={inputClass} value={form.model_number} onChange={(e) => set('model_number', e.target.value)} placeholder="e.g. DS-2CD2143G2-I" />
              </Field>
              <Field label="Camera type">
                <select className={selectClass} value={form.camera_type} onChange={(e) => set('camera_type', e.target.value as CameraModelCreate['camera_type'])}>
                  <option value="bullet">Bullet</option>
                  <option value="fixed_dome">Fixed Dome</option>
                  <option value="ptz">PTZ</option>
                </select>
              </Field>
              <Field label="Location / environment">
                <input className={inputClass} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Indoor, Outdoor, Vandal-proof" />
              </Field>
              <div className="col-span-2">
                <Field label="Notes">
                  <textarea
                    className={`${inputClass} h-20 py-2 resize-none`}
                    value={form.notes ?? ''}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Optional notes or description"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* ── Lens ───────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 mt-0">Lens</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Lens type">
                <select className={selectClass} value={form.lens_type} onChange={(e) => handleLensTypeChange(e.target.value as CameraModelCreate['lens_type'])}>
                  <option value="fixed">Fixed</option>
                  <option value="varifocal">Varifocal</option>
                  <option value="optical_zoom">Optical Zoom</option>
                </select>
              </Field>
              <Field label="IR range (m)" hint="0 = no IR illuminator">
                <input type="number" min={0} step={1} className={inputClass} value={form.ir_range} onChange={(e) => set('ir_range', parseFloat(e.target.value) || 0)} />
              </Field>

              <Field label="Focal length min (mm) *">
                <input
                  type="number" min={0.1} step={0.1}
                  className={`${inputClass} ${errors.focal_length_min ? 'border-red-500' : ''}`}
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
                {errors.focal_length_min && <p className="text-xs text-red-500 mt-1 mb-0">{errors.focal_length_min}</p>}
              </Field>
              <Field label={`Focal length max (mm) *${isFixed ? ' — auto-synced' : ''}`}>
                <input
                  type="number" min={0.1} step={0.1}
                  disabled={isFixed}
                  className={`${inputClass} ${errors.focal_length_max ? 'border-red-500' : ''} disabled:opacity-50`}
                  value={form.focal_length_max}
                  onChange={(e) => set('focal_length_max', parseFloat(e.target.value) || 0)}
                />
                {errors.focal_length_max && <p className="text-xs text-red-500 mt-1 mb-0">{errors.focal_length_max}</p>}
              </Field>

              <Field label="H-FOV min °" hint="Tele end (narrow)">
                <input
                  type="number" min={0.1} max={359} step={0.1}
                  className={`${inputClass} ${errors.h_fov_min ? 'border-red-500' : ''}`}
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
                {errors.h_fov_min && <p className="text-xs text-red-500 mt-1 mb-0">{errors.h_fov_min}</p>}
              </Field>
              <Field label={`H-FOV max °${isFixed ? ' — auto-synced' : ''}`} hint="Wide end">
                <input
                  type="number" min={0.1} max={359} step={0.1}
                  disabled={isFixed}
                  className={`${inputClass} ${errors.h_fov_max ? 'border-red-500' : ''} disabled:opacity-50`}
                  value={form.h_fov_max}
                  onChange={(e) => set('h_fov_max', parseFloat(e.target.value) || 0)}
                />
                {errors.h_fov_max && <p className="text-xs text-red-500 mt-1 mb-0">{errors.h_fov_max}</p>}
              </Field>

              <Field label="V-FOV min °" hint="Tele end (narrow)">
                <input
                  type="number" min={0.1} max={179} step={0.1}
                  className={`${inputClass} ${errors.v_fov_min ? 'border-red-500' : ''}`}
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
                {errors.v_fov_min && <p className="text-xs text-red-500 mt-1 mb-0">{errors.v_fov_min}</p>}
              </Field>
              <Field label={`V-FOV max °${isFixed ? ' — auto-synced' : ''}`} hint="Wide end">
                <input
                  type="number" min={0.1} max={179} step={0.1}
                  disabled={isFixed}
                  className={`${inputClass} ${errors.v_fov_max ? 'border-red-500' : ''} disabled:opacity-50`}
                  value={form.v_fov_max}
                  onChange={(e) => set('v_fov_max', parseFloat(e.target.value) || 0)}
                />
                {errors.v_fov_max && <p className="text-xs text-red-500 mt-1 mb-0">{errors.v_fov_max}</p>}
              </Field>

              <Field label="IR cut filter">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.ir_cut_filter}
                    onChange={(e) => set('ir_cut_filter', e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm text-slate-300">Enabled</span>
                </label>
              </Field>
            </div>
          </section>

          {/* ── Sensor ─────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 mt-0">Sensor</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Resolution H (px) *">
                <input
                  type="number" min={1} step={1}
                  className={`${inputClass} ${errors.resolution_h ? 'border-red-500' : ''}`}
                  value={form.resolution_h}
                  onChange={(e) => set('resolution_h', parseInt(e.target.value) || 0)}
                />
                {errors.resolution_h && <p className="text-xs text-red-500 mt-1 mb-0">{errors.resolution_h}</p>}
              </Field>
              <Field label="Resolution V (px) *">
                <input
                  type="number" min={1} step={1}
                  className={`${inputClass} ${errors.resolution_v ? 'border-red-500' : ''}`}
                  value={form.resolution_v}
                  onChange={(e) => set('resolution_v', parseInt(e.target.value) || 0)}
                />
                {errors.resolution_v && <p className="text-xs text-red-500 mt-1 mb-0">{errors.resolution_v}</p>}
              </Field>

              <Field label="Sensor type">
                <select className={selectClass} value={form.sensor_type} onChange={(e) => set('sensor_type', e.target.value as CameraModelCreate['sensor_type'])}>
                  <option value="cmos">CMOS</option>
                </select>
              </Field>
              <Field label="Sensor size">
                <input className={inputClass} value={form.sensor_size ?? ''} onChange={(e) => set('sensor_size', e.target.value)} placeholder='e.g. 1/2.8"' />
              </Field>

              <Field label="Min illumination (lux)" hint="0 = works in total darkness (IR)">
                <input type="number" min={0} step={0.001} className={inputClass} value={form.min_illumination} onChange={(e) => set('min_illumination', parseFloat(e.target.value) || 0)} />
              </Field>

              <div className="flex flex-col gap-2">
                <Field label="WDR">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.wdr}
                      onChange={(e) => set('wdr', e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm text-slate-300">Enabled</span>
                  </label>
                </Field>
                {form.wdr && (
                  <Field label="WDR strength (dB)">
                    <input
                      type="number" min={1} step={1}
                      className={inputClass}
                      value={form.wdr_db ?? ''}
                      onChange={(e) => set('wdr_db', parseFloat(e.target.value) || null)}
                      placeholder="e.g. 120"
                    />
                  </Field>
                )}
              </div>
            </div>
          </section>

          {/* ── Actions ────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2 border-t border-slate-800">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold rounded-lg border-none cursor-pointer transition-colors disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving…' : isNew ? 'Create Camera Model' : 'Save Changes'}
            </button>
            <Link
              to="/admin/manage/cameras"
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-lg no-underline transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
