import type { CameraModelCreate } from '../../../types/cameramodel.types'
import Section from './Section'
import Field from './Field'
import InputWithUnit from './InputWithUnit'
import Toggle from './Toggle'
import { inputClass } from './formStyles'

interface Props {
  form: CameraModelCreate
  set: <K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) => void
}

export default function AdvancedSection({ form, set }: Props) {
  return (
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
            <span className="text-sm text-muted">Enabled</span>
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
  )
}
