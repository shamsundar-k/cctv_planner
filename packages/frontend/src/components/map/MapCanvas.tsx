import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, type ReactNode } from 'react'
import type { Map as LeafletMap, TileLayer } from 'leaflet'
import { useMapViewStore } from '../../store/mapViewSlice'
import CameraLayer from './CameraLayer'
import FovLayer from './FovLayer'
import {
  buildTileUrl, TILE_ATTRIBUTION,
  CROSSHAIR_TOOLS, DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM,
  type MapCanvasProps
} from './MapCanvas/tileUtils'

export default function MapCanvas({ centerLat, centerLng, defaultZoom, projectId, children }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tileLayerRef = useRef<TileLayer | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  const basemapStyle = useMapViewStore((s) => s.basemapStyle)
  const activeTool = useMapViewStore((s) => s.activeTool)
  const setLeafletMap = useMapViewStore((s) => s.setLeafletMap)

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      const lat = centerLat ?? DEFAULT_LAT
      const lng = centerLng ?? DEFAULT_LNG
      const zoom = defaultZoom ?? DEFAULT_ZOOM

      const leafletMap = L.map(containerRef.current!, {
        zoomControl: true,
      }).setView([lat, lng], zoom)

      mapRef.current = leafletMap
      console.log('Map instance:', leafletMap)
      setLeafletMap(leafletMap)

      const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY
      const tileLayer = L.tileLayer(buildTileUrl(basemapStyle, stadiaKey), {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 20,
      }).addTo(leafletMap)

      tileLayerRef.current = tileLayer
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        tileLayerRef.current = null
        setLeafletMap(null)
      }
    }
  }, [setLeafletMap])

  // Switch tile layer when basemap style changes
  useEffect(() => {
    if (!tileLayerRef.current) return
    const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY
    tileLayerRef.current.setUrl(buildTileUrl(basemapStyle, stadiaKey))
  }, [basemapStyle])

  // Update map cursor based on active tool
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.getContainer().style.cursor = CROSSHAIR_TOOLS.has(activeTool) ? 'crosshair' : ''
  }, [activeTool])

  return (
    <>
      <div ref={containerRef} className="flex-1 relative min-w-0" />
      <FovLayer projectId={projectId} />
      <CameraLayer projectId={projectId} />
      {children}
    </>
  )
}
