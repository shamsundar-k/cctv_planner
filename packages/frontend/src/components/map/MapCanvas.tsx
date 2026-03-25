import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Map as LeafletMap, TileLayer, LayerGroup } from 'leaflet'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import MapContext from './MapContext'
import {
  buildTileUrl, TILE_ATTRIBUTION,
  CROSSHAIR_TOOLS, DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM,
  type MapCanvasProps
} from './MapCanvas/tileUtils'

export default function MapCanvas({ centerLat, centerLng, defaultZoom, children }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tileLayerRef = useRef<TileLayer | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const cameraLayerRef = useRef<LayerGroup | null>(null)
  const fovLayerRef = useRef<LayerGroup | null>(null)
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [cameraLayer, setCameraLayer] = useState<LayerGroup | null>(null)
  const [fovLayer, setFovLayer] = useState<LayerGroup | null>(null)

  const basemapStyle = useMapViewStore((s) => s.basemapStyle)
  const activeTool = useMapViewStore((s) => s.activeTool)
  const clearSelection = useCameraLayerStore((s) => s.clearSelection)

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
      setMap(leafletMap)

      const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY
      const tileLayer = L.tileLayer(buildTileUrl(basemapStyle, stadiaKey), {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 20,
      }).addTo(leafletMap)

      tileLayerRef.current = tileLayer

      const camLayer = L.layerGroup().addTo(leafletMap)
      const fovLayerGroup = L.layerGroup().addTo(leafletMap)
      cameraLayerRef.current = camLayer
      fovLayerRef.current = fovLayerGroup
      setCameraLayer(camLayer)
      setFovLayer(fovLayerGroup)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        tileLayerRef.current = null
        cameraLayerRef.current = null
        fovLayerRef.current = null
        setMap(null)
        setCameraLayer(null)
        setFovLayer(null)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Deselect camera when clicking map background
  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    const handler = () => {
      if (activeTool === 'select' || activeTool === 'pan') clearSelection()
    }
    m.on('click', handler)
    return () => { m.off('click', handler) }
  }, [activeTool, clearSelection])

  return (
    <MapContext.Provider value={{ map, cameraLayer, fovLayer }}>
      <div
        ref={containerRef}
        className="flex-1 relative"
        style={{ minWidth: 0 }}
      />
      {children}
    </MapContext.Provider>
  )
}
