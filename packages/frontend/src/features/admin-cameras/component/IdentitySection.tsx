import type { CameraModelCreate } from '../../../types/cameramodel.types'
import CollapsibleSection from '../../../components/ui/CollapsibleSection'
import Field from './Field'
import { inputClass, selectClass } from './formStyles'

interface Props {
  form: CameraModelCreate
  errors: Record<string, string>
  set: <K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) => void
}

export default function IdentitySection({ form, errors, set }: Props) {
  return (
    <CollapsibleSection title="Identity">
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
    </CollapsibleSection>
  )
}
