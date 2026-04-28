import { useEffect } from 'react'
import type L from 'leaflet'
import { useMapContext } from '@/context/MapContext'

/**
 * Stub for `draw-line` tool mode.
 * Registers a map click handler on mount and removes it on unmount.
 * Returns null — no UI rendered.
 */
export default function DrawLineOverlay() {
    const { mapRef } = useMapContext()

    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const handler = (e: L.LeafletMouseEvent) => {
            console.log('DrawLineOverlay click', e.latlng)
        }

        map.on('click', handler)
        return () => { map.off('click', handler) }
    }, [mapRef])

    return null
}
