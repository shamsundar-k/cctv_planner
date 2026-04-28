import { useEffect } from 'react'
import { X, Crosshair } from 'lucide-react'
import { useParams } from 'react-router'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import { useSelectedCameraModelStore } from '@/store/selectedCameraModelSlice'
import { useCameraStore } from '@/store/cameraStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { generateDefaultCamera } from '@/lib/cameraGenerator'

// Derive cursor SVG from the Lucide Crosshair icon node list at module load time.
// Crosshair icon node: circle r=10 + 4 line stubs, all on a 24×24 grid.
const RETICLE_CURSOR = (() => {
    const size = 32
    const scale = size / 24          // map Lucide's 24-unit grid → 32 px
    const iconNodes = (Crosshair as unknown as { __iconNode?: [string, Record<string, string | number>][] }).__iconNode ?? []

    const elems = iconNodes.map(([tag, attrs]) => {
        const scaled = Object.fromEntries(
            Object.entries(attrs).map(([k, v]) => [
                k,
                ['cx', 'cy', 'r', 'x1', 'x2', 'y1', 'y2'].includes(k)
                    ? String(Number(v) * scale)
                    : v,
            ]),
        )
        const attrStr = Object.entries(scaled)
            .filter(([k]) => k !== 'key')
            .map(([k, v]) => `${k}='${v}'`)
            .join(' ')
        return `<${tag} ${attrStr}/>`
    }).join('')

    // Shadow pass (dark outline) + main pass (white fill)
    const shadow = elems
        .replace(/stroke='[^']*'/g, `stroke='rgba(0,0,0,0.5)'`)
        .replace(/stroke-width='[^']*'/g, `stroke-width='3'`)
    const main = elems
        .replace(/stroke='[^']*'/g, `stroke='white'`)
        .replace(/stroke-width='[^']*'/g, `stroke-width='1.5'`)

    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' ` +
        `viewBox='0 0 ${size} ${size}' fill='none' stroke-linecap='round' stroke-linejoin='round'>` +
        shadow + main +
        `</svg>`

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${size / 2} ${size / 2}, crosshair`
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
