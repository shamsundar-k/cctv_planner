import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'


/**
 * Purely visual layer. Manages the Leaflet LayerGroup lifecycle.
 * Zero tool awareness — draw tool click handling is in DrawLineOverlay / DrawPolygonOverlay.
 */
export default function DrawLayer() {
    const { mapRef } = useMapContext()
    const groupRef = useRef<L.LayerGroup | null>(null)

    useEffect(() => {
        const map = mapRef.current
        if (!map) return
        const group = L.layerGroup().addTo(map)
        groupRef.current = group
        console.log('DrawLayer initialized')
        return () => {
            group.remove()
            groupRef.current = null
        }
    }, [mapRef]) // eslint-disable-line react-hooks/exhaustive-deps

    return null
}
