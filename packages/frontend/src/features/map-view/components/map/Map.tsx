import { useEffect, useRef, useState, type ReactNode } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContext } from '@/context/MapContext'
import BaseTile from './BaseTile'
import { LAYER_NAMES, type LayerName } from '@/config/mapConfig'
import MapToolbar from '../toolbar/MapToolbar'
import { MapActionsToolbar } from '../map-actions'

interface MapProps {
  center?: L.LatLngExpression
  zoom?: number
  children?: ReactNode
}

const DEFAULT_VISIBLE = Object.fromEntries(
  LAYER_NAMES.map((name) => [name, true])
) as Record<LayerName, boolean>

export default function Map({ center = [51.5, -0.09], zoom = 13 }: MapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersRef = useRef<Partial<Record<LayerName, L.LayerGroup>>>({})

  const [mapReady, setMapReady] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerName, boolean>>(DEFAULT_VISIBLE)

  useEffect(() => {
    if (mapInstanceRef.current || !mapDivRef.current) return

    const map = L.map(mapDivRef.current).setView(center, zoom)
    map.zoomControl.setPosition('topright')
    mapInstanceRef.current = map


    LAYER_NAMES.forEach((name) => {
      layersRef.current[name] = L.layerGroup().addTo(map)
    })
    setMapReady(true)

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      layersRef.current = {}
    }
  }, []) // intentionally empty — init once only

  const toggleLayer = (name: LayerName) => {
    const map = mapInstanceRef.current
    const layer = layersRef.current[name]
    if (!map || !layer) return

    const isVisible = map.hasLayer(layer)
    isVisible ? map.removeLayer(layer) : map.addLayer(layer)
    setVisibleLayers((prev) => ({ ...prev, [name]: !isVisible }))
  }

  return (
    <MapContext.Provider value={{ mapRef: mapInstanceRef, layersRef, visibleLayers, toggleLayer }}>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
        {mapReady && <BaseTile />}
        {mapReady && <MapToolbar />}
        {mapReady && <MapActionsToolbar />}
      </div>
    </MapContext.Provider>
  )
}
