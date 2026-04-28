import { useEffect } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'

/**
 * Active for `pan` and `select` tool modes.
 * Clears camera selection when the map background is clicked.
 * Renders nothing — purely a side-effect component.
 */
export default function DefaultOverlay() {
    const { mapRef } = useMapContext()

    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const handler = () => {
            useCameraLayerStore.getState().clearSelection()
        }

        map.on('click', handler)
        return () => { map.off('click', handler) }
    }, [mapRef])

    return null
}
