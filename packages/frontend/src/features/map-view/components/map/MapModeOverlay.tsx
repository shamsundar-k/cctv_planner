import { useMapActionsStore } from '@/store/mapActionsSlice'
import { DefaultOverlay, DrawOverlay, MeasureOverlay, PlaceCameraOverlay } from '../overlays'

/**
 * Single subscriber to `activeTool`.
 * Mounts the correct overlay component for the active tool mode.
 * Each overlay manages its own map click handler lifecycle.
 */
export default function MapModeOverlay() {
    const activeTool = useMapActionsStore((s) => s.activeTool)

    switch (activeTool) {
        case 'pan':
        case 'select':
            return <DefaultOverlay />
        case 'place-camera':
            return <PlaceCameraOverlay />
        case 'draw-line':
        case 'draw-polygon':
            return <DrawOverlay tool={activeTool} />
        case 'measure':
            return <MeasureOverlay />
        default:
            return null
    }
}
