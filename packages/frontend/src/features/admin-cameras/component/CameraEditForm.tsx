import { Link } from 'react-router'
import type { CameraModelCreate } from '../../../types/cameramodel.types'
import { SENSOR_FORMATS } from '../../../constants/sensorFormats'
import { calcMegapixels, calcAspectRatio } from '../utils/cameraFormHelpers'
import Section from './Section'
import Field from './Field'
import InputWithUnit from './InputWithUnit'
import Toggle from './Toggle'

const inputClass =
  'w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'
const selectClass =
  'w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'

interface Props {
  isNew: boolean
  form: CameraModelCreate
  setForm: React.Dispatch<React.SetStateAction<CameraModelCreate>>
  errors: Record<string, string>
  sensorIsCustom: boolean
  setSensorIsCustom: (v: boolean) => void
  set: <K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) => void
  handleLensTypeChange: (lt: CameraModelCreate['lens_type']) => void
  handleSubmit: (e: React.FormEvent) => void
  isPending: boolean
  isFixed: boolean
}

export default function CameraEditForm({
  isNew,
  form,
  setForm,
  errors,
  sensorIsCustom,
  setSensorIsCustom,
  set,
  handleLensTypeChange,
  handleSubmit,
  isPending,
  isFixed,
}: Props) {
  return (
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

          <Field
            label="Sensor Size"
            hint={
              !sensorIsCustom && form.sensor_size
                ? `Physical width: ${SENSOR_FORMATS.find((f) => f.format === form.sensor_size)?.widthMm} mm`
                : undefined
            }
          >
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
              {SENSOR_FORMATS.filter((f) => f.format !== 'Custom').map(({ format, widthMm }) => (
                <option key={format} value={format}>
                  {format} ({widthMm} mm)
                </option>
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
  )
}
