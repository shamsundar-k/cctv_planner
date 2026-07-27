import type { FormValues } from './types'
import { FormField, inputCls } from './shared'

interface CameraFormProps {
  form: FormValues
  setField: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
  parseNullableNumber: (raw: string) => number | ''
  setTargetWidth: (value: number) => void
  focalRange: { min: number; max: number } | null
  targetWidthRange: { min: number; max: number } | null
}

interface ControlProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  disabled?: boolean
}

function Control({ label, unit, value, min, max, step, onChange, disabled }: ControlProps) {
  return (
    <FormField label={label}>
      <div className="grid grid-cols-[minmax(0,1fr)_84px] items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(parseFloat(event.target.value))} disabled={disabled} className="w-full accent-primary disabled:opacity-40" />
        <div className="relative">
          <input type="number" min={min} max={max} step={step} value={Number.isFinite(value) ? Number(value.toFixed(2)) : 0} onChange={(event) => onChange(parseFloat(event.target.value) || min)} disabled={disabled} className={`${inputCls} pr-7 text-right tabular-nums disabled:opacity-50`} />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">{unit}</span>
        </div>
      </div>
    </FormField>
  )
}

export default function CameraForm({ form, setField, parseNullableNumber, setTargetWidth, focalRange, targetWidthRange }: CameraFormProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      <div className="grid grid-cols-[minmax(0,1fr)_42px] gap-2">
        <FormField label="Camera label">
          <input type="text" value={form.label} onChange={(event) => setField('label', event.target.value)} placeholder="Entrance Camera" className={inputCls} />
        </FormField>
        <FormField label="Colour">
          <input type="color" value={form.color} onChange={(event) => setField('color', event.target.value)} className="h-[30px] w-full cursor-pointer rounded-md border border-panel-border bg-background p-0.5" />
        </FormField>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-panel-border bg-background/50 p-3">
        <Control label="Install height" unit="m" value={form.height} min={0.1} max={30} step={0.1} onChange={(value) => setField('height', value)} />
        <Control label="Bearing" unit="°" value={form.bearing} min={0} max={359} step={1} onChange={(value) => setField('bearing', value)} />
        <Control label="Target height" unit="m" value={form.target_height} min={0.1} max={20} step={0.1} onChange={(value) => setField('target_height', value)} />
        <FormField label="Target distance">
          <div className="grid grid-cols-[minmax(0,1fr)_84px] items-center gap-3">
            <input type="range" min={1} max={500} step={1} value={form.target_distance === '' ? 1 : form.target_distance} onChange={(event) => setField('target_distance', parseFloat(event.target.value))} className="w-full accent-primary" />
            <div className="relative">
              <input type="number" min={0.1} max={500} step={0.1} value={form.target_distance} onChange={(event) => setField('target_distance', parseNullableNumber(event.target.value))} className={`${inputCls} pr-7 text-right tabular-nums`} />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">m</span>
            </div>
          </div>
        </FormField>
        <Control label="Target width" unit="m" value={form.target_width} min={targetWidthRange?.min ?? 0} max={targetWidthRange?.max ?? 1} step={0.1} onChange={setTargetWidth} disabled={!targetWidthRange || targetWidthRange.min === targetWidthRange.max} />
        <Control label="Focal length" unit="mm" value={form.focal_length} min={focalRange?.min ?? 1} max={focalRange?.max ?? 1} step={0.1} onChange={(value) => setField('focal_length', value)} disabled={!focalRange || focalRange.min === focalRange.max} />
        <div className="flex items-center justify-between border-t border-panel-border pt-2 text-[10px] text-text-muted">
          <span>Wide</span>
          <span>Tele</span>
        </div>
      </div>
    </div>
  )
}
