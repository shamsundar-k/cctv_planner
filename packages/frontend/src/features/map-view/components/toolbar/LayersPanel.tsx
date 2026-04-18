import { X } from 'lucide-react'
import { LAYER_NAMES, type LayerName } from '../../../../config/mapConfig'
import { useMapContext } from '../../../../context/MapContext'

interface Props {
  onClose: () => void
}

const LAYER_LABELS: Record<LayerName, string> = {
  cameras: 'Cameras',
  FOV: 'FOV',
  Draw: 'Draw',
}

export default function LayersPanel({ onClose }: Props) {
  const { visibleLayers, toggleLayer } = useMapContext()

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
          className="transition-colors p-0.5 rounded"
          style={{ color: 'var(--theme-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-secondary)')}
          aria-label="Close panel"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {LAYER_NAMES.map((name) => {
          const isVisible = visibleLayers[name] ?? true
          return (
            <label key={name} className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => toggleLayer(name)}
                className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isVisible ? 'var(--theme-accent)' : 'transparent',
                  border: `1.5px solid ${isVisible ? 'var(--theme-accent)' : 'color-mix(in srgb, var(--theme-surface) 60%, transparent)'}`,
                }}
              >
                {isVisible && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="var(--theme-accent-text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className="text-[12px] transition-colors"
                style={{ color: isVisible ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)' }}
              >
                {LAYER_LABELS[name]}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
