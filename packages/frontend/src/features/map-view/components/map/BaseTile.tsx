import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { BASE_MAPS } from '../../../../config/mapConfig'
import { useMapContext } from '../../../../context/MapContext'
import { useBaseTileStore } from '../../../../store/baseTileStore'

// Headless component — no DOM output
export default function BaseTile() {
  const { mapRef } = useMapContext()
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const activeBaseMap = useBaseTileStore((s) => s.activeBaseMap)

  useEffect(() => {
    if (!mapRef.current || tileLayerRef.current) return

    const { attribution, get_url } = BASE_MAPS[activeBaseMap]
    tileLayerRef.current = L.tileLayer(get_url(), { attribution }).addTo(mapRef.current)

    return () => {
      tileLayerRef.current?.remove()
      tileLayerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef.current])

  useEffect(() => {
    if (!tileLayerRef.current) return
    tileLayerRef.current.setUrl(BASE_MAPS[activeBaseMap].get_url())
  }, [activeBaseMap])

  return null
}
