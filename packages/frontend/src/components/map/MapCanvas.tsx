import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

const DEFAULT_LAT = 12.9716
const DEFAULT_LNG = 77.5946
const DEFAULT_ZOOM = 13

interface MapCanvasProps {
  centerLat?: number | null
  centerLng?: number | null
  defaultZoom?: number | null
}

export default function MapCanvas({ centerLat, centerLng, defaultZoom }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      const lat = centerLat ?? DEFAULT_LAT
      const lng = centerLng ?? DEFAULT_LNG
      const zoom = defaultZoom ?? DEFAULT_ZOOM

      const map = L.map(containerRef.current!, {
        zoomControl: true,
      }).setView([lat, lng], zoom)

      mapRef.current = map

      const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY
      L.tileLayer(
        `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png${stadiaKey ? `?api_key=${stadiaKey}` : ''}`,
        {
          attribution:
            '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ' +
            '&copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> ' +
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 20,
        },
      ).addTo(map)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="flex-1 relative"
      style={{ minWidth: 0 }}
    />
  )
}
