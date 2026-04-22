import type { CameraModelCreate } from '../../../types/cameramodel.types'
import Section from './Section'
import Field from './Field'
import InputWithUnit from './InputWithUnit'
import Toggle from './Toggle'
import { inputClass, selectClass } from './formStyles'

interface Props {
  form: CameraModelCreate
  errors: Record<string, string>
  set: <K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) => void
  setForm: React.Dispatch<React.SetStateAction<CameraModelCreate>>
  handleLensTypeChange: (lt: CameraModelCreate['lens_type']) => void
  isFixed: boolean
}

export default function LensSection({ form, errors, set, setForm, handleLensTypeChange, isFixed }: Props) {
  return (
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
              className={`${inputClass} pr-10 ${errors.focal_length_max ? 'border-red-400' : ''} disabled:opacity-50 disabled:bg-surface`}
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
              className={`${inputClass} pr-8 ${errors.h_fov_max ? 'border-red-400' : ''} disabled:opacity-50 disabled:bg-surface`}
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
              className={`${inputClass} pr-8 ${errors.v_fov_max ? 'border-red-400' : ''} disabled:opacity-50 disabled:bg-surface`}
              value={form.v_fov_max}
              onChange={(e) => set('v_fov_max', parseFloat(e.target.value) || 0)}
            />
          </InputWithUnit>
          {errors.v_fov_max && <p className="text-xs text-red-500 mt-1 mb-0">{errors.v_fov_max}</p>}
        </Field>

        <Field label="IR Cut Filter">
          <div className="flex items-center gap-3 h-9">
            <Toggle checked={form.ir_cut_filter} onChange={(v) => set('ir_cut_filter', v)} />
            <span className="text-sm text-muted">Enabled</span>
          </div>
        </Field>
      </div>
    </Section>
  )
}
