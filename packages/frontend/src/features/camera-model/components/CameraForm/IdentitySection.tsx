import type { CameraSpecForm } from '@/types/camera'
import CollapsibleSection from '../../../../components/ui/CollapsibleSection'
import Field from '../../../../components/ui/FormField'
import SelectField from '../../../../components/ui/SelectField'
import { inputClass } from './formStyles'

interface Props {
  form: CameraSpecForm
  errors: Record<string, string>
  set: <K extends keyof CameraSpecForm>(key: K, value: CameraSpecForm[K]) => void
}

export default function IdentitySection({ form, errors, set }: Props) {
  return (
    <CollapsibleSection title="Identity">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Name *">
          <input
            className={`${inputClass} ${errors.name ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Name"
          />
          {errors.name && <p className="mb-0 mt-1 text-xs text-error">{errors.name}</p>}
        </Field>

        <Field label="Manufacturer">
          <input
            className={`${inputClass} ${errors.manufacturer ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
            value={form.manufacturer}
            onChange={(e) => set('manufacturer', e.target.value)}
            placeholder="Manufacturer"
          />
          {errors.manufacturer && <p className="mb-0 mt-1 text-xs text-error">{errors.manufacturer}</p>}
        </Field>

        <Field label="Model">
          <input
            className={`${inputClass} ${errors.model ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
            value={form.model}
            onChange={(e) => set('model', e.target.value)}
            placeholder="Model"
          />
          {errors.model && <p className="mb-0 mt-1 text-xs text-error">{errors.model}</p>}
        </Field>

        <Field label="Camera Type">
          <SelectField
            value={form.camera_type}
            onChange={(e) => set('camera_type', e.target.value as CameraSpecForm['camera_type'])}
          >
            <option value="bullet">Bullet</option>
            <option value="dome">Dome</option>
            <option value="ptz">PTZ</option>
          </SelectField>
        </Field>
      </div>
    </CollapsibleSection>
  )
}
