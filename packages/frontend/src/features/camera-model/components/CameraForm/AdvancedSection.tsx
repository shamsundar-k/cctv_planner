import type { CameraSpecForm } from '@/types/camera'
import CollapsibleSection from '../../../../components/ui/CollapsibleSection'
import Field from '../../../../components/ui/FormField'
import InputWithUnit from '../../../../components/ui/InputWithUnit'
import { parseNumberInput } from './cameraFormHelpers'
import { inputClass } from './formStyles'

interface Props {
  form: CameraSpecForm
  errors: Record<string, string>
  set: <K extends keyof CameraSpecForm>(key: K, value: CameraSpecForm[K]) => void
}

export default function AdvancedSection({ form, errors, set }: Props) {
  return (
    <CollapsibleSection title="IR">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              className={`${inputClass} pr-8 ${errors.ir_range ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
              value={form.ir_range}
              onChange={(e) => set('ir_range', parseNumberInput(e.target.value))}
            />
          </InputWithUnit>
          {errors.ir_range && <p className="mb-0 mt-1 text-xs text-error">{errors.ir_range}</p>}
        </Field>
      </div>
    </CollapsibleSection>
  )
}
