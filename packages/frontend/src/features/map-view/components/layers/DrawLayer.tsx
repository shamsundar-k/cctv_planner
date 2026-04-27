import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'

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

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = (e: L.LeafletMouseEvent) => {
      console.log('DrawLayer clicked', e.latlng)
    }
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, []) // mapRef is a stable ref — intentionally omitted

  return null
}
