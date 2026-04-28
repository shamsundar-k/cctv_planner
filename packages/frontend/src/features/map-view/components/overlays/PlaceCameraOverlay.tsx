import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useParams } from 'react-router'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import { useSelectedCameraModelStore } from '@/store/selectedCameraModelSlice'
import { useCameraStore } from '@/store/cameraStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { generateDefaultCamera } from '@/lib/cameraGenerator'

// Lucide Crosshair geometry scaled from 24×24 → 32×32 (factor 4/3).
// Hardcoded so we don't rely on Lucide's internal __iconNode property.
const _CROSSHAIR_ELEMS =
    `<circle cx='16' cy='16' r='13.33'/>` +
    `<line x1='29.33' x2='24' y1='16' y2='16'/>` +
    `<line x1='8' x2='2.67' y1='16' y2='16'/>` +
    `<line x1='16' x2='16' y1='2.67' y2='8'/>` +
    `<line x1='16' x2='16' y1='24' y2='29.33'/>`

const RETICLE_CURSOR = (() => {
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' ` +
        `viewBox='0 0 32 32' fill='none' stroke-linecap='round' stroke-linejoin='round'>` +
        `<g stroke='rgba(0,0,0,0.5)' stroke-width='3'>${_CROSSHAIR_ELEMS}</g>` +
        `<g stroke='white' stroke-width='1.5'>${_CROSSHAIR_ELEMS}</g>` +
        `</svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, crosshair`
})()

/**
 * Active for `place-camera` tool mode.
 * On mount: sets reticle cursor, registers ESC → pan, registers click-to-place handler.
 * On unmount: cleans up all side-effects.
 * Renders the mode banner UI.
 */
export default function PlaceCameraOverlay() {
    const { mapRef } = useMapContext()
    const { id: projectId = '' } = useParams<{ id: string }>()
    const setActiveTool = useMapActionsStore((s) => s.setActiveTool)
    const selectedCameraModel = useSelectedCameraModelStore((s) => s.selectedCameraModel)

    // Reticle cursor
    useEffect(() => {
        const container = mapRef.current?.getContainer()
        if (!container) return
        container.style.cursor = RETICLE_CURSOR
        return () => { container.style.cursor = '' }
    }, [mapRef])

    // ESC → reset to pan
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveTool('pan')
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [setActiveTool])

    // Click-to-place camera handler
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const handler = (e: L.LeafletMouseEvent) => {
            const model = useSelectedCameraModelStore.getState().selectedCameraModel
            if (!model) return

            const localCamera = generateDefaultCamera(
                model.id,
                { lat: e.latlng.lat, lng: e.latlng.lng },
                projectId,
            )
            if (localCamera) {
                useCameraStore.getState().addCamera(localCamera)

            }
        }

        map.on('click', handler)
        return () => { map.off('click', handler) }
    }, [mapRef, projectId])

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/55 border border-accent/40 backdrop-blur-md shadow-lg text-sm whitespace-nowrap">
            <span className="font-semibold text-primary">Camera Insert Mode : {selectedCameraModel?.name}</span>
            <button
                onClick={() => setActiveTool('pan')}
                className="ml-1 flex items-center justify-center rounded-md p-0.5 text-muted hover:text-primary hover:bg-surface/40 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    )
}
