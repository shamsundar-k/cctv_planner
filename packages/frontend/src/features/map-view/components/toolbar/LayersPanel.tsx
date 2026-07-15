import { Check, X } from 'lucide-react'
import { LAYERS, useLayerVisibilityStore } from '@/store/layerVisibilityStore'

interface Props {
  onClose: () => void
}

export default function LayersPanel({ onClose }: Props) {
  const visible = useLayerVisibilityStore((state) => state.visible)
  const toggleLayer = useLayerVisibilityStore((state) => state.toggleLayer)

  return (
    <div className="w-[180px] rounded-lg border border-panel-border bg-panel p-3 shadow-xl">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase text-text-secondary">Layers</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Close layers panel"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      <div className="grid gap-1">
        {LAYERS.map(({ key, label }) => (
          <button
            type="button"
            key={key}
            onClick={() => toggleLayer(key)}
            className="flex min-h-9 items-center gap-2 rounded-md px-1.5 text-left text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-pressed={visible[key]}
          >
            <span className={`grid size-4 shrink-0 place-items-center rounded border ${visible[key] ? 'border-primary bg-primary text-primary-foreground' : 'border-panel-border bg-background'}`}>
              {visible[key] && <Check size={10} strokeWidth={2} aria-hidden />}
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
