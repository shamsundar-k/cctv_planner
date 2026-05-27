import type { CameraSpecForm } from '@/types/camera'
import CollapsibleSection from '../../../../components/ui/CollapsibleSection'
import Field from '../../../../components/ui/FormField'
import InputWithUnit from '../../../../components/ui/InputWithUnit'
import { inputClass } from './formStyles'

interface Props {
  form: CameraSpecForm
  errors: Record<string, string>
  set: <K extends keyof CameraSpecForm>(key: K, value: CameraSpecForm[K]) => void
}

export default function AdvancedSection({ form, errors, set }: Props) {
  return (
    <CollapsibleSection title="IR">
      <div className="grid grid-cols-3 gap-4">
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
              className={`${inputClass} pr-8 ${errors.ir_range ? 'border-red-400' : ''}`}
              value={form.ir_range}
              onChange={(e) => set('ir_range', parseFloat(e.target.value) || 0)}
            />
          </InputWithUnit>
          {errors.ir_range && <p className="text-xs text-red-500 mt-1 mb-0">{errors.ir_range}</p>}
        </Field>
      </div>
    </CollapsibleSection>
  )
}
