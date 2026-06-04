import type { FormValues } from './types'
import { FormField, inputStyle, inputCls } from './shared'

interface CameraFormProps {
  form: FormValues
  setField: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
  parseNullableNumber: (raw: string) => number | ''
}

export default function CameraForm({ form, setField, parseNullableNumber }: CameraFormProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
      <FormField label="Label">
        <input type="text" value={form.label} onChange={(e) => setField('label', e.target.value)} placeholder="e.g. Entrance Camera" className={inputCls} style={inputStyle} />
      </FormField>

      <FormField label="Colour">
        <div className="flex items-center gap-2">
          <input type="color" value={form.color} onChange={(e) => setField('color', e.target.value)} className="w-8 h-8 cursor-pointer rounded p-0.5 shrink-0" style={{ border: '1px solid color-mix(in srgb, var(--theme-surface) 35%, transparent)', background: 'transparent' }} />
          <input type="text" value={form.color} onChange={(e) => setField('color', e.target.value)} maxLength={7} className={inputCls} style={inputStyle} />
        </div>
      </FormField>

      <FormField label="Height above ground (m)">
        <input type="number" min={0.1} step={0.1} value={form.height} onChange={(e) => setField('height', parseFloat(e.target.value) || 0.1)} className={inputCls} style={inputStyle} />
      </FormField>

      <FormField label="Bearing (°)">
        <div className="flex flex-col gap-1">
          <input type="range" min={0} max={360} step={1} value={form.bearing} onChange={(e) => setField('bearing', parseInt(e.target.value))} className="w-full" style={{ accentColor: 'var(--theme-accent)' }} />
          <input type="number" min={0} max={360} step={1} value={form.bearing} onChange={(e) => setField('bearing', parseFloat(e.target.value) || 0)} className={inputCls} style={inputStyle} />
        </div>
      </FormField>

      <FormField label="Target Distance (m)">
        <input type="number" min={0} step={0.1} value={form.target_distance} onChange={(e) => setField('target_distance', parseNullableNumber(e.target.value))} placeholder="e.g. 50" className={inputCls} style={inputStyle} />
      </FormField>

      <FormField label="Target Height (m)">
        <input type="number" min={0.1} step={0.1} value={form.target_height} onChange={(e) => setField('target_height', parseFloat(e.target.value) || 0.1)} className={inputCls} style={inputStyle} />
      </FormField>
    </div>
  )
}
