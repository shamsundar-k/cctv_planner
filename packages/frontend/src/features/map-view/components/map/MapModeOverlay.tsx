import { useMapActionsStore } from '@/store/mapActionsSlice'
import { DefaultOverlay, PlaceCameraOverlay } from '../overlays'

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
        default:
            return null
    }
}
