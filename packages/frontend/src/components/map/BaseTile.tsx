// src/components/map/BaseTile.tsx

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { BASE_MAPS } from '../../config/mapConfig'
import { useMapContext } from '../../context/MapContext'
import { useBaseTileStore } from '../../store/baseTileStore'

// Headless component — no DOM output
export default function BaseTile() {
    const { mapRef } = useMapContext()
    const tileLayerRef = useRef<L.TileLayer | null>(null)
    const activeBaseMap = useBaseTileStore((s) => s.activeBaseMap)

    // Init tile layer once when map is ready
    useEffect(() => {
        if (!mapRef.current || tileLayerRef.current) return

        const { attribution, get_url } = BASE_MAPS[activeBaseMap]

        console.log("Adding the base tile layer to map")
        tileLayerRef.current = L.tileLayer(get_url(), { attribution }).addTo(mapRef.current)

        return () => {
            console.log("Removing the base tile layer from map")
            tileLayerRef.current?.remove()
            tileLayerRef.current = null
        }
    }, [mapRef.current])

    // Swap URL imperatively when active base map changes
    useEffect(() => {
        if (!tileLayerRef.current) return
        tileLayerRef.current.setUrl(BASE_MAPS[activeBaseMap].get_url())
    }, [activeBaseMap])

    return null
}
