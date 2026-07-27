import { useEffect } from 'react'
import L from 'leaflet'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore, type ActiveTool } from '@/store/mapActionsSlice'
import MapToolBanner from './MapToolBanner'

interface DrawOverlayProps {
    tool: Extract<ActiveTool, 'draw-line' | 'draw-polygon'>
}

const DRAW_CONFIG = {
    'draw-line': {
        shape: 'Line',
        title: 'Draw Line',
        instructions: 'Click to add points. Double-click or press Enter to finish.',
    },
    'draw-polygon': {
        shape: 'Polygon',
        title: 'Draw Polygon',
        instructions: 'Click to add corners. Click the first point or press Enter to finish.',
    },
} as const satisfies Record<
    DrawOverlayProps['tool'],
    {
        shape: 'Line' | 'Polygon'
        title: string
        instructions: string
    }
>

export default function DrawOverlay({ tool }: DrawOverlayProps) {
    const { mapRef } = useMapContext()
    const setActiveTool = useMapActionsStore((state) => state.setActiveTool)
    const config = DRAW_CONFIG[tool]

    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const handleCreate: L.PM.CreateEventHandler = (event) => {
            if (event.shape === config.shape) {
                setActiveTool('select')
            }
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActiveTool('select')
            }
        }

        map.on('pm:create', handleCreate)
        window.addEventListener('keydown', handleKeyDown)
        map.pm.enableDraw(config.shape, {
            allowSelfIntersection: config.shape !== 'Polygon',
            continueDrawing: false,
            finishOnEnter: true,
            pathOptions: {
                color: 'var(--color-primary)',
                fillColor: 'var(--color-primary)',
                fillOpacity: config.shape === 'Polygon' ? 0.16 : 0,
                weight: 3,
            },
            templineStyle: {
                color: 'var(--color-primary)',
                weight: 3,
            },
            hintlineStyle: {
                color: 'var(--color-primary)',
                dashArray: '6 6',
                weight: 2,
            },
        })

        return () => {
            map.off('pm:create', handleCreate)
            window.removeEventListener('keydown', handleKeyDown)
            map.pm.disableDraw(config.shape)
        }
    }, [config, mapRef, setActiveTool])

    return <MapToolBanner title={config.title} instructions={config.instructions} />
}
