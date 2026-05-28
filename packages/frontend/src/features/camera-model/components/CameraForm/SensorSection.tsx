import type { CameraSpecForm } from '@/types/camera'
import { SENSOR_FORMATS } from '../../../../constants/sensorFormats'
import { calcMegapixels, parseIntegerInput } from './cameraFormHelpers'
import CollapsibleSection from '../../../../components/ui/CollapsibleSection'
import Field from '../../../../components/ui/FormField'
import InputWithUnit from '../../../../components/ui/InputWithUnit'
import SelectField from '../../../../components/ui/SelectField'
import { inputClass } from './formStyles'

interface Props {
  form: CameraSpecForm
  errors: Record<string, string>
  set: <K extends keyof CameraSpecForm>(key: K, value: CameraSpecForm[K]) => void
}
export default function SensorSection({ form, errors, set }: Props) {
  return (
    <CollapsibleSection title="Sensor">
      <div className="grid grid-cols-4 gap-4">
        <Field label="Resolution H *">
          <InputWithUnit unit="px">
            <input
              type="number"
              min={1}
              step={1}
              className={`${inputClass} pr-8 ${errors.resolution_h ? 'border-red-400' : ''}`}
              value={form.resolution_h}
              onChange={(e) => set('resolution_h', parseIntegerInput(e.target.value))}
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
              onChange={(e) => set('resolution_v', parseIntegerInput(e.target.value))}
            />
          </InputWithUnit>
          {errors.resolution_v && <p className="text-xs text-red-500 mt-1 mb-0">{errors.resolution_v}</p>}
        </Field>

        <Field label="Megapixels">
          <div className="h-9 flex items-center gap-1">
            <span className="text-base font-semibold text-primary">
              {calcMegapixels(form.resolution_h, form.resolution_v)}
            </span>
            <span className="text-xs text-muted">MP</span>
          </div>
        </Field>

        <Field
          label="Sensor"
          hint={
            form.sensor_size
              ? `Physical width: ${SENSOR_FORMATS.find((f) => f.format === form.sensor_size)?.widthMm} mm`
              : undefined
          }
        >
          <SelectField
            value={form.sensor_size ?? ''}
            onChange={(e) => {
              const val = e.target.value
              set('sensor_size', val || null)
            }}
          >
            <option value="">— select format —</option>
            {SENSOR_FORMATS.filter((f) => f.format !== 'Custom').map(({ format }) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </SelectField>
        </Field>
      </div>
    </CollapsibleSection>
  )
}
