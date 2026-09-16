import { useEffect } from 'react'
import L from 'leaflet'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore, type ActiveTool } from '@/store/mapActionsSlice'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import {
    createLocalDrawing,
    lineShapeFromPoints,
    polygonShapeFromRings,
    useMapDrawingStore,
} from '@/features/map-drawing'
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
    const addDrawing = useMapDrawingStore((state) => state.addDrawing)
    const selectDrawing = useMapDrawingStore((state) => state.selectDrawing)
    const config = DRAW_CONFIG[tool]

    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const handleCreate: L.PM.CreateEventHandler = (event) => {
            if (event.shape !== config.shape || !(event.layer instanceof L.Polyline)) return

            const latLngs = event.layer.getLatLngs()
            const shape = event.shape === 'Line'
                && latLngs.every((point) => point instanceof L.LatLng)
                ? lineShapeFromPoints(latLngs)
                : event.shape === 'Polygon'
                    && latLngs.every(
                        (ring) => Array.isArray(ring)
                            && ring.every((point) => point instanceof L.LatLng),
                    )
                    ? polygonShapeFromRings(latLngs as L.LatLng[][])
                    : null

            event.layer.remove()
            if (shape) {
                const drawing = createLocalDrawing(shape)
                if (addDrawing(drawing)) {
                    useCameraLayerStore.getState().clearSelection()
                    selectDrawing(drawing.uid)
                }
            }
            setActiveTool('select')
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
    }, [addDrawing, config, mapRef, selectDrawing, setActiveTool])

    return <MapToolBanner title={config.title} instructions={config.instructions} />
}
