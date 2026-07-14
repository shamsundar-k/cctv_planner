import type { CameraSpecForm } from '@/types/camera'
import CollapsibleSection from '../../../../components/ui/CollapsibleSection'
import Field from '../../../../components/ui/FormField'
import InputWithUnit from '../../../../components/ui/InputWithUnit'
import SelectField from '../../../../components/ui/SelectField'
import { parseNumberInput } from './cameraFormHelpers'
import { inputClass } from './formStyles'

interface Props {
  form: CameraSpecForm
  errors: Record<string, string>
  set: <K extends keyof CameraSpecForm>(key: K, value: CameraSpecForm[K]) => void
  setForm: React.Dispatch<React.SetStateAction<CameraSpecForm>>
  handleLensTypeChange: (lt: CameraSpecForm['lens_type']) => void
  isFixed: boolean
}

export default function LensSection({ form, errors, set, setForm, handleLensTypeChange, isFixed }: Props) {
  return (
    <CollapsibleSection title="Lens">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Field label="Lens Type">
          <SelectField
            value={form.lens_type}
            onChange={(e) => handleLensTypeChange(e.target.value as CameraSpecForm['lens_type'])}
          >
            <option value="fixed">Fixed</option>
            <option value="varifocal">Varifocal</option>
          </SelectField>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <Field label="Focal Length Min">
            <InputWithUnit unit="mm">
              <input
                type="number"
                min={0.1}
                step={0.1}
                className={`${inputClass} pr-10 ${errors.focal_length_min ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                value={form.focal_length_min}
                onChange={(e) => {
                  const v = parseNumberInput(e.target.value)
                  setForm((prev) => ({
                    ...prev,
                    focal_length_min: v,
                    focal_length_max: isFixed ? v : prev.focal_length_max,
                  }))
                }}
              />
            </InputWithUnit>
            {errors.focal_length_min && <p className="mb-0 mt-1 text-xs text-error">{errors.focal_length_min}</p>}
          </Field>

          <Field label={isFixed ? 'Focal Length Max — auto-synced' : 'Focal Length Max'}>
            <InputWithUnit unit="mm">
              <input
                type="number"
                min={0.1}
                step={0.1}
                disabled={isFixed}
                className={`${inputClass} pr-10 ${errors.focal_length_max ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                value={form.focal_length_max}
                onChange={(e) => set('focal_length_max', parseNumberInput(e.target.value))}
              />
            </InputWithUnit>
            {errors.focal_length_max && <p className="mb-0 mt-1 text-xs text-error">{errors.focal_length_max}</p>}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <Field
            label={isFixed ? 'H-FOV Max — auto-synced' : 'H-FOV Max'}
            tooltip="Horizontal field of view — wide end is the broadest angle"
            hint="Wide end"
          >
            <InputWithUnit unit="°">
              <input
                type="number"
                min={0.1}
                max={179}
                step={0.1}
                disabled={isFixed}
                className={`${inputClass} pr-8 ${errors.h_fov_max ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                value={form.h_fov_max}
                onChange={(e) => set('h_fov_max', parseNumberInput(e.target.value))}
              />
            </InputWithUnit>
            {errors.h_fov_max && <p className="mb-0 mt-1 text-xs text-error">{errors.h_fov_max}</p>}
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
                max={179}
                step={0.1}
                className={`${inputClass} pr-8 ${errors.h_fov_min ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                value={form.h_fov_min}
                onChange={(e) => {
                  const v = parseNumberInput(e.target.value)
                  setForm((prev) => ({
                    ...prev,
                    h_fov_min: v,
                    h_fov_max: isFixed ? v : prev.h_fov_max,
                  }))
                }}
              />
            </InputWithUnit>
            {errors.h_fov_min && <p className="mb-0 mt-1 text-xs text-error">{errors.h_fov_min}</p>}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
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
                className={`${inputClass} pr-8 ${errors.v_fov_max ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                value={form.v_fov_max}
                onChange={(e) => set('v_fov_max', parseNumberInput(e.target.value))}
              />
            </InputWithUnit>
            {errors.v_fov_max && <p className="mb-0 mt-1 text-xs text-error">{errors.v_fov_max}</p>}
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
                className={`${inputClass} pr-8 ${errors.v_fov_min ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                value={form.v_fov_min}
                onChange={(e) => {
                  const v = parseNumberInput(e.target.value)
                  setForm((prev) => ({
                    ...prev,
                    v_fov_min: v,
                    v_fov_max: isFixed ? v : prev.v_fov_max,
                  }))
                }}
              />
            </InputWithUnit>
            {errors.v_fov_min && <p className="mb-0 mt-1 text-xs text-error">{errors.v_fov_min}</p>}
          </Field>
        </div>
      </div>
    </CollapsibleSection>
  )
}
