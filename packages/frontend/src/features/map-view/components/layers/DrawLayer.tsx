import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useZones } from '@/api/zones'
import type { Zone } from '@/types/zone.types'

interface DrawLayerProps {
  projectId: string
}

function isPolygon(geojson: Zone['geojson']): geojson is { type: 'Polygon'; coordinates: [number, number][][] } {
  return geojson.type === 'Polygon'
}

export default function DrawLayer({ projectId }: DrawLayerProps) {
  const { mapRef } = useMapContext()
  const groupRef = useRef<L.LayerGroup | null>(null)
  const { data: zones } = useZones(projectId)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const group = L.layerGroup().addTo(map)
    groupRef.current = group
    return () => {
      group.remove()
      groupRef.current = null
    }
  }, [mapRef]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.clearLayers()
    if (!zones) return

    for (const zone of zones) {
      if (!zone.visible) continue
      const colour = zone.colour
      const opts = { color: colour, weight: 2 }

      if (isPolygon(zone.geojson)) {
        const latLngs = zone.geojson.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number])
        L.polygon(latLngs, { ...opts, fillColor: colour, fillOpacity: 0.15 }).addTo(group)
      } else {
        const latLngs = zone.geojson.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
        L.polyline(latLngs, opts).addTo(group)
      }
    }
  }, [zones])

  return null
}
