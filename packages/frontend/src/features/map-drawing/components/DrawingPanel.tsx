import { useEffect, useState, type ReactNode } from 'react'
import { Lock, Trash2, X } from 'lucide-react'
import type {
  DrawingPurpose,
  DrawingStyle,
  MapDrawingBase,
} from '../types'
import { useMapDrawingStore } from '../store/store'

const PURPOSE_OPTIONS: { value: DrawingPurpose; label: string }[] = [
  { value: 'annotation', label: 'Annotation' },
  { value: 'coverage_zone', label: 'Coverage zone' },
  { value: 'exclusion_zone', label: 'Exclusion zone' },
  { value: 'site_boundary', label: 'Site boundary' },
]

const inputClass = 'w-full rounded-md border border-panel-border bg-background px-2 py-1.5 text-xs text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  )
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function shapeLabel(shapeType: MapDrawingBase['shape']['shape_type']): string {
  return shapeType.charAt(0).toUpperCase() + shapeType.slice(1)
}

interface DrawingPanelContentProps {
  uid: string
}

function DrawingPanelContent({ uid }: DrawingPanelContentProps) {
  const record = useMapDrawingStore((state) => state.drawingRecords[uid])
  const updateDrawing = useMapDrawingStore((state) => state.updateDrawing)
  const removeDrawing = useMapDrawingStore((state) => state.removeDrawing)
  const clearSelection = useMapDrawingStore((state) => state.clearSelection)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearSelection()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearSelection])

  if (!record) return null
  const { drawing, tracking } = record
  const hasFill = drawing.shape.shape_type !== 'line'

  const updateStyle = <Key extends keyof DrawingStyle>(
    key: Key,
    value: DrawingStyle[Key],
  ) => updateDrawing(uid, { style: { ...drawing.style, [key]: value } })

  const updateRadius = (rawValue: string) => {
    if (drawing.shape.shape_type !== 'circle') return
    const radius = Number(rawValue)
    if (!Number.isFinite(radius)) return
    updateDrawing(uid, {
      shape: {
        ...drawing.shape,
        radius_metres: clamp(radius, 0.01, 100_000),
      },
    })
  }

  const deleteDrawing = () => {
    if (drawing.locked) return
    removeDrawing(uid)
  }

  return (
    <div className="flex h-full w-[360px] flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-panel-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-text-primary">Drawing Properties</h2>
          {tracking.status === 'failed' && (
            <span className="text-[10px] font-medium text-error">Save failed</span>
          )}
          {tracking.status === 'saving' && (
            <span className="text-[10px] font-medium text-primary">Saving...</span>
          )}
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Close drawing properties"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="rounded-md border border-panel-border bg-background px-3 py-2">
          <span className="text-[10px] uppercase text-text-secondary">Shape</span>
          <p className="text-xs font-semibold text-text-primary">
            {shapeLabel(drawing.shape.shape_type)}
          </p>
        </div>

        <Field label="Label">
          <input
            type="text"
            maxLength={120}
            value={drawing.label}
            onChange={(event) => updateDrawing(uid, { label: event.target.value })}
            placeholder="Untitled drawing"
            className={inputClass}
          />
        </Field>

        <Field label="Purpose">
          <select
            value={drawing.purpose}
            onChange={(event) => updateDrawing(uid, {
              purpose: event.target.value as DrawingPurpose,
            })}
            className={inputClass}
          >
            {PURPOSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>

        {drawing.shape.shape_type === 'circle' && (
          <Field label="Radius (metres)">
            <input
              type="number"
              min={0.01}
              max={100_000}
              step={0.1}
              value={drawing.shape.radius_metres}
              onChange={(event) => updateRadius(event.target.value)}
              className={inputClass}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Stroke colour">
            <input
              type="color"
              value={drawing.style.stroke_color}
              onChange={(event) => updateStyle('stroke_color', event.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-panel-border bg-background p-1"
            />
          </Field>
          {hasFill && (
            <Field label="Fill colour">
              <input
                type="color"
                value={drawing.style.fill_color}
                onChange={(event) => updateStyle('fill_color', event.target.value)}
                className="h-9 w-full cursor-pointer rounded-md border border-panel-border bg-background p-1"
              />
            </Field>
          )}
        </div>

        <Field label={`Stroke width: ${drawing.style.stroke_width}px`}>
          <input
            type="range"
            min={1}
            max={12}
            step={0.5}
            value={drawing.style.stroke_width}
            onChange={(event) => updateStyle('stroke_width', Number(event.target.value))}
            className="w-full accent-primary"
          />
        </Field>

        <Field label="Line style">
          <select
            value={drawing.style.line_style}
            onChange={(event) => updateStyle(
              'line_style',
              event.target.value as DrawingStyle['line_style'],
            )}
            className={inputClass}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </Field>

        <Field label={`Stroke opacity: ${Math.round(drawing.style.stroke_opacity * 100)}%`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={drawing.style.stroke_opacity}
            onChange={(event) => updateStyle('stroke_opacity', Number(event.target.value))}
            className="w-full accent-primary"
          />
        </Field>

        {hasFill && (
          <Field label={`Fill opacity: ${Math.round(drawing.style.fill_opacity * 100)}%`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={drawing.style.fill_opacity}
              onChange={(event) => updateStyle('fill_opacity', Number(event.target.value))}
              className="w-full accent-primary"
            />
          </Field>
        )}

        <div className="grid gap-2 border-t border-panel-border pt-4">
          <label className="flex items-center justify-between gap-3 text-xs text-text-primary">
            <span>Visible on map</span>
            <input
              type="checkbox"
              checked={drawing.visible}
              onChange={(event) => updateDrawing(uid, { visible: event.target.checked })}
              className="size-4 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-xs text-text-primary">
            <span className="inline-flex items-center gap-1.5">
              <Lock size={12} aria-hidden /> Lock geometry
            </span>
            <input
              type="checkbox"
              checked={drawing.locked}
              onChange={(event) => updateDrawing(uid, { locked: event.target.checked })}
              className="size-4 accent-primary"
            />
          </label>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-panel-border px-4 py-2">
        {!confirmDelete ? (
          <>
            <p className={`text-[10px] font-medium ${tracking.isDirty ? 'text-warning' : 'text-text-muted'}`}>
              {tracking.status === 'saving'
                ? 'Saving changes…'
                : tracking.isDirty ? 'Unsaved changes' : 'All changes saved'}
            </p>
            <button
              type="button"
              disabled={drawing.locked}
              onClick={() => setConfirmDelete(true)}
              title={drawing.locked ? 'Unlock the drawing before deleting it' : 'Delete drawing'}
              className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-panel-border bg-background px-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-error/50 hover:bg-error/5 hover:text-error disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
            >
              <Trash2 size={12} aria-hidden /> Delete
            </button>
          </>
        ) : (
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-error">Delete this drawing?</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-7 rounded-md border border-panel-border bg-background px-2.5 text-[11px] font-medium text-text-secondary hover:bg-divider/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteDrawing}
                className="h-7 rounded-md border border-error bg-error px-2.5 text-[11px] font-semibold text-error-foreground hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DrawingPanel() {
  const selectedDrawingUid = useMapDrawingStore((state) => state.selectedDrawingUid)

  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden border-l border-panel-border bg-panel transition-[width] duration-200"
      style={{ width: selectedDrawingUid ? 360 : 0 }}
      aria-hidden={!selectedDrawingUid}
    >
      {selectedDrawingUid && (
        <DrawingPanelContent key={selectedDrawingUid} uid={selectedDrawingUid} />
      )}
    </aside>
  )
}
