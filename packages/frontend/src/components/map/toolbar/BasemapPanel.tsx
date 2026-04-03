// src/components/map/toolbar/BasemapPanel.tsx

import { X, Check } from 'lucide-react'
import { BASE_MAPS, type BaseMapKey } from '../../../config/mapConfig'
import { useBaseTileStore } from '../../../store/baseTileStore'

interface Props {
    onClose: () => void
}

export default function BasemapPanel({ onClose }: Props) {
    const activeBaseMap = useBaseTileStore((s) => s.activeBaseMap)
    const setBaseMap = useBaseTileStore((s) => s.setBaseMap)

    const entries = Object.entries(BASE_MAPS) as [BaseMapKey, typeof BASE_MAPS[BaseMapKey]][]

    return (
        <div
            className="rounded-xl p-3 w-[212px] shadow-xl"
            style={{
                background: 'var(--theme-bg-card)',
                border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
                <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--theme-text-secondary)' }}
                >
                    Base Map
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

            {/* Thumbnail grid */}
            <div className="grid grid-cols-2 gap-2">
                {entries.map(([key, tile]) => {
                    const isActive = key === activeBaseMap
                    return (
                        <button
                            key={key}
                            onClick={() => setBaseMap(key)}
                            className="rounded-lg overflow-hidden text-left transition-all"
                            style={{
                                outline: isActive
                                    ? '2px solid var(--theme-accent)'
                                    : '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)',
                                outlineOffset: '0px',
                            }}
                        >
                            <img
                                src={tile.image}
                                alt={tile.label}
                                className="w-full h-12 object-cover block"
                                draggable={false}
                            />
                            <div
                                className="px-1.5 py-1 flex items-center justify-between gap-1"
                                style={{ background: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)' }}
                            >
                                <span
                                    className="text-[11px] font-semibold truncate"
                                    style={{ color: 'var(--theme-text-primary)' }}
                                >
                                    {tile.label}
                                </span>
                                {isActive && (
                                    <Check size={10} style={{ color: 'var(--theme-accent)', flexShrink: 0 }} />
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}