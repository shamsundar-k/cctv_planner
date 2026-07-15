import { Check, X } from 'lucide-react'
import { BASE_MAPS, type BaseMapKey } from '@/config/mapConfig'
import { useBaseTileStore } from '@/store/baseTileStore'

interface Props {
  onClose: () => void
}

export default function BasemapPanel({ onClose }: Props) {
  const activeBaseMap = useBaseTileStore((state) => state.activeBaseMap)
  const setBaseMap = useBaseTileStore((state) => state.setBaseMap)
  const entries = Object.entries(BASE_MAPS) as [BaseMapKey, (typeof BASE_MAPS)[BaseMapKey]][]

  return (
    <div className="w-[212px] rounded-lg border border-panel-border bg-panel p-3 shadow-xl">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase text-text-secondary">Base Map</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Close base map panel"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {entries.map(([key, tile]) => {
          const isActive = key === activeBaseMap
          return (
            <button
              type="button"
              key={key}
              onClick={() => setBaseMap(key)}
              className={`overflow-hidden rounded-lg border bg-background text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive ? 'border-primary ring-1 ring-primary' : 'border-panel-border hover:border-primary/50'
              }`}
              aria-pressed={isActive}
            >
              <img src={tile.image} alt="" className="block h-12 w-full object-cover" draggable={false} />
              <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                <span className="truncate text-[11px] font-semibold text-text-primary">{tile.label}</span>
                {isActive && <Check size={11} className="shrink-0 text-primary" aria-hidden />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
