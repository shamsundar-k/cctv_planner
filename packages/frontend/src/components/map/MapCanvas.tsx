import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, TileLayer } from 'leaflet'
import { useMapViewStore, type BasemapStyle } from '../../store/mapViewSlice'

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
  onMapReady?: (map: LeafletMap) => void
}

export default function MapCanvas({ centerLat, centerLng, defaultZoom, onMapReady }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const tileLayerRef = useRef<TileLayer | null>(null)
  const onMapReadyRef = useRef(onMapReady)
  onMapReadyRef.current = onMapReady

  const basemapStyle = useMapViewStore((s) => s.basemapStyle)
  const activeTool = useMapViewStore((s) => s.activeTool)

  // Initialise map once
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
      onMapReadyRef.current?.(map)

      const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY
      const tileLayer = L.tileLayer(buildTileUrl(basemapStyle, stadiaKey), {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 20,
      }).addTo(map)

      tileLayerRef.current = tileLayer
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        tileLayerRef.current = null
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

  return (
    <div
      ref={containerRef}
      className="flex-1 relative"
      style={{ minWidth: 0 }}
    />
  )
}
