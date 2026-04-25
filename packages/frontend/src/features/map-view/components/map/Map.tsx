import { useEffect, useRef, useState, type ReactNode } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContext } from '@/context/MapContext'
import BaseTile from './BaseTile'
import MapToolbar from '../toolbar/MapToolbar'
import { MapActionsToolbar } from '../map-actions'

interface MapProps {
  center?: L.LatLngExpression
  zoom?: number
  children?: ReactNode
}

export default function Map({ center = [51.5, -0.09], zoom = 13, children }: MapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (mapInstanceRef.current || !mapDivRef.current) return

    const map = L.map(mapDivRef.current).setView(center, zoom)
    map.zoomControl.setPosition('topright')
    mapInstanceRef.current = map
    setMapReady(true)

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, []) // intentionally empty — init once only

  return (
    <MapContext.Provider value={{ mapRef: mapInstanceRef }}>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
        {mapReady && <BaseTile />}
        {mapReady && <MapToolbar />}
        {mapReady && <MapActionsToolbar />}
        {mapReady && children}
      </div>
    </MapContext.Provider>
  )
}
