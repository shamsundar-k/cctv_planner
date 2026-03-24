import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Map as LeafletMap, TileLayer, LayerGroup } from 'leaflet'
import { useMapViewStore, type BasemapStyle } from '../../store/mapViewSlice'
import MapContext from './MapContext'

const CROSSHAIR_TOOLS = new Set(['place-camera'])

const DEFAULT_LAT = 12.9716
const DEFAULT_LNG = 77.5946
const DEFAULT_ZOOM = 13

function buildTileUrl(style: BasemapStyle, apiKey: string | undefined): string {
  const r = '{r}'
  const base = `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}${r}.png`
  return apiKey ? `${base}?api_key=${apiKey}` : base
}

const TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ' +
  '&copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

interface MapCanvasProps {
  centerLat?: number | null
  centerLng?: number | null
  defaultZoom?: number | null
  children?: ReactNode
}

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
  const setSelectedCamera = useMapViewStore((s) => s.setSelectedCamera)

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
      if (activeTool === 'select' || activeTool === 'pan') setSelectedCamera(null)
    }
    m.on('click', handler)
    return () => { m.off('click', handler) }
  }, [activeTool, setSelectedCamera])

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
