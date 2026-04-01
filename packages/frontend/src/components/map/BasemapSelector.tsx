import { useState, useRef, useEffect } from 'react'
import { Layers, X, Check } from 'lucide-react'
import { BASE_MAPS, type BaseMapKey } from '../../config/mapConfig'
import { useBaseTileStore } from '../../store/baseTileStore'

export default function BasemapSelector() {
    const activeBaseMap = useBaseTileStore((s) => s.activeBaseMap)
    const setBaseMap = useBaseTileStore((s) => s.setBaseMap)

    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Close on outside click
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
                    className={`absolute bottom-[calc(100%+30px)] right-0 z-[1001]
            w-8 h-8 flex items-center justify-center rounded-md cursor-pointer
            bg-white border transition-colors
            ${open
                            ? 'border-blue-400 bg-gray-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }
          `}
                    aria-label="Select base map"
                >
                    <Layers size={15} className="text-gray-500" />
                </button>

                {/* Tooltip — suppressed while panel is open */}
                {!open && (
                    <div className="
            absolute bottom-[calc(100%+6px)] right-0 z-[1001]
            px-2 py-1 rounded text-[11px] text-white whitespace-nowrap
            bg-gray-800/80 pointer-events-none
            opacity-0 group-hover:opacity-100 transition-opacity duration-150
          ">
                        {BASE_MAPS[activeBaseMap].label}
                    </div>
                )}
            </div>

            {/* ── Expanded panel ── */}
            {open && (
                <div className="
          absolute bottom-[calc(100%+8px)] right-0 z-[1001]
          bg-white border border-gray-200 rounded-xl p-3 w-[212px]
        ">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                            Base map
                        </span>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                            aria-label="Close without changing"
                        >
                            <X size={13} />
                        </button>
                    </div>

                    {/* Tile grid — 3 columns, one per style */}
                    <div className="grid grid-cols-3 gap-2">
                        {entries.map(([key, tile]) => {
                            const isActive = key === activeBaseMap
                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setBaseMap(key)   // ← store update
                                        //setOpen(false)
                                    }}
                                    className={`
                    rounded-md overflow-hidden text-left transition-all
                    ${isActive
                                            ? 'ring-2 ring-blue-500 ring-offset-0'
                                            : 'ring-1 ring-gray-200 hover:ring-gray-400'
                                        }
                  `}
                                >
                                    <img
                                        src={tile.image}
                                        alt={tile.label}
                                        className="w-full h-12 object-cover block"
                                        draggable={false}
                                    />

                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}