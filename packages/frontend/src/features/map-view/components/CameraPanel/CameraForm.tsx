import type { FormValues } from './types'
import { FormField, inputCls } from './shared'

interface CameraFormProps {
  form: FormValues
  setField: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
  parseNullableNumber: (raw: string) => number | ''
}

export default function CameraForm({ form, setField, parseNullableNumber }: CameraFormProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3">
      <FormField label="Label">
        <input type="text" value={form.label} onChange={(event) => setField('label', event.target.value)} placeholder="e.g. Entrance Camera" className={inputCls} />
      </FormField>

      <FormField label="Color">
        <div className="flex items-center gap-2">
          <input type="color" value={form.color} onChange={(event) => setField('color', event.target.value)} className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-panel-border bg-background p-0.5" />
          <input type="text" value={form.color} onChange={(event) => setField('color', event.target.value)} maxLength={7} className={inputCls} />
        </div>
      </FormField>

      <FormField label="Height above ground (m)">
        <input type="number" min={0.1} step={0.1} value={form.height} onChange={(event) => setField('height', parseFloat(event.target.value) || 0.1)} className={inputCls} />
      </FormField>

      <FormField label="Bearing (deg)">
        <div className="flex flex-col gap-1">
          <input type="range" min={0} max={360} step={1} value={form.bearing} onChange={(event) => setField('bearing', parseInt(event.target.value))} className="w-full accent-primary" />
          <input type="number" min={0} max={360} step={1} value={form.bearing} onChange={(event) => setField('bearing', parseFloat(event.target.value) || 0)} className={inputCls} />
        </div>
      </FormField>

      <FormField label="Target distance (m)">
        <input type="number" min={0} step={0.1} value={form.target_distance} onChange={(event) => setField('target_distance', parseNullableNumber(event.target.value))} placeholder="e.g. 50" className={inputCls} />
      </FormField>

      <FormField label="Target height (m)">
        <input type="number" min={0.1} step={0.1} value={form.target_height} onChange={(event) => setField('target_height', parseFloat(event.target.value) || 0.1)} className={inputCls} />
      </FormField>
    </div>
  )
}
