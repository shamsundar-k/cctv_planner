import { useState, useRef, useEffect } from 'react'
import { Layers, X, Check } from 'lucide-react'
import { BASE_MAPS, type BaseMapKey } from '../../config/mapConfig'
import { useBaseTileStore } from '../../store/baseTileStore'

export default function BasemapSelector() {
    const activeBaseMap = useBaseTileStore((s) => s.activeBaseMap)
    const setBaseMap = useBaseTileStore((s) => s.setBaseMap)

    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const entries = Object.entries(BASE_MAPS) as [BaseMapKey, typeof BASE_MAPS[BaseMapKey]][]

    return (
        <div ref={ref} className="relative">

            {/* ── Trigger button ── */}
            <div className="relative group">
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer border transition-all"
                    style={{
                        background: open ? 'var(--theme-bg-card)' : 'var(--theme-bg-card)',
                        borderColor: open ? 'var(--theme-accent)' : 'color-mix(in srgb, var(--theme-surface) 30%, transparent)',
                    }}
                    aria-label="Select base map"
                >
                    <Layers size={15} style={{ color: 'var(--theme-text-secondary)' }} />
                </button>

                {/* Tooltip */}
                {!open && (
                    <div
                        className="absolute bottom-[calc(100%+6px)] right-0 px-2 py-1 rounded text-[11px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        style={{ background: 'color-mix(in srgb, var(--theme-bg-base) 90%, transparent)', color: 'var(--theme-text-primary)' }}
                    >
                        {BASE_MAPS[activeBaseMap].label}
                    </div>
                )}
            </div>

            {/* ── Expanded panel — anchored above the button via bottom+right ── */}
            {open && (
                <div
                    className="absolute bottom-[calc(100%+8px)] right-0 rounded-xl p-3 w-[212px] shadow-xl"
                    style={{ background: 'var(--theme-bg-card)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
                >
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                            Base map
                        </span>
                        <button
                            onClick={() => setOpen(false)}
                            className="transition-colors p-0.5 rounded"
                            style={{ color: 'var(--theme-text-secondary)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-text-primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-text-secondary)')}
                            aria-label="Close without changing"
                        >
                            <X size={13} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {entries.map(([key, tile]) => {
                            const isActive = key === activeBaseMap
                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setBaseMap(key)
                                        setOpen(false)
                                    }}
                                    className="rounded-lg overflow-hidden text-left transition-all"
                                    style={{
                                        outline: isActive ? `2px solid var(--theme-accent)` : `1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)`,
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
                                        <span className="text-[11px] font-semibold truncate" style={{ color: 'var(--theme-text-primary)' }}>
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
            )}
        </div>
    )
}