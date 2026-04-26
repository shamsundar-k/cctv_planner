import { X, Check } from 'lucide-react'
import { LAYERS, useLayerVisibilityStore } from '@/store/layerVisibilityStore'

interface Props {
  onClose: () => void
}

export default function LayersPanel({ onClose }: Props) {
  const visible = useLayerVisibilityStore((s) => s.visible)
  const toggleLayer = useLayerVisibilityStore((s) => s.toggleLayer)

  return (
    <div
      className="rounded-xl p-3 w-[180px] shadow-xl"
      style={{
        background: 'var(--theme-bg-card)',
        border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Layers
        </span>
        <button
          onClick={onClose}
          className="transition-colors p-0.5 rounded hover:text-[var(--theme-text-primary)]"
          style={{ color: 'var(--theme-text-secondary)' }}
          aria-label="Close panel"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {LAYERS.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => toggleLayer(key)}
              className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: visible[key] ? 'var(--theme-accent)' : 'transparent',
                border: `1.5px solid ${visible[key] ? 'var(--theme-accent)' : 'color-mix(in srgb, var(--theme-surface) 60%, transparent)'}`,
              }}
            >
              {visible[key] && <Check size={8} stroke="var(--theme-accent-text)" strokeWidth={1.5} />}
            </div>
            <span
              className="text-[12px] transition-colors"
              style={{ color: visible[key] ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)' }}
            >
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
