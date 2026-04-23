import type { CameraModelCreate } from '../../../types/cameramodel.types'
import { SENSOR_FORMATS } from '../../../constants/sensorFormats'
import { calcMegapixels, calcAspectRatio } from '../utils/cameraFormHelpers'
import CollapsibleSection from '../../../components/ui/CollapsibleSection'
import Field from '../../../components/ui/FormField'
import InputWithUnit from '../../../components/ui/InputWithUnit'
import SelectField from '../../../components/ui/SelectField'
import { inputClass } from './formStyles'

interface Props {
  form: CameraModelCreate
  errors: Record<string, string>
  set: <K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) => void
  sensorIsCustom: boolean
  setSensorIsCustom: (v: boolean) => void
}

export default function SensorSection({ form, errors, set, sensorIsCustom, setSensorIsCustom }: Props) {
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
          <div className="h-9 flex items-center gap-1">
            <span className="text-base font-semibold text-primary">
              {calcMegapixels(form.resolution_h, form.resolution_v)}
            </span>
            <span className="text-xs text-muted">MP</span>
          </div>
        </Field>

        <Field label="Aspect Ratio">
          <div className="h-9 flex items-center">
            <span className="text-base font-semibold text-primary">
              {calcAspectRatio(form.resolution_h, form.resolution_v)}
            </span>
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
          <SelectField
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
          </SelectField>
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
          <SelectField
            value={form.sensor_type}
            onChange={(e) => set('sensor_type', e.target.value as CameraModelCreate['sensor_type'])}
          >
            <option value="cmos">CMOS</option>
          </SelectField>
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
    </CollapsibleSection>
  )
}
