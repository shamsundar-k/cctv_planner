/**
 * FovLayer — orchestrates per-camera FOV polygons.
 *
 * Subscribes only to `uids` so it re-renders only when cameras are added or removed.
 */
import L from 'leaflet'
import { useState, useEffect } from 'react'
import type { LayerGroup } from 'leaflet'
import { useMapViewStore } from '../../../../store/mapViewSlice'
import { useCameraInstanceStore } from '../../../../store/cameraInstanceStore'
// import FovPolygon from './FovPolygon'

interface FovLayerProps {
  projectId: string
}

export default function FovLayer({ projectId }: FovLayerProps) {
  const uids = useCameraInstanceStore((s) => s.uids)
  const map = useMapViewStore((s) => s.leafletMap)

  const [layer, setLayer] = useState<LayerGroup | null>(null)

  useEffect(() => {
    if (!map) return
    const lg = L.layerGroup().addTo(map)
    setLayer(lg)
    return () => {
      lg.remove()
      setLayer(null)
    }
  }, [map])

  return (
    <>
      {/* {uids.map((id) => (
        <FovPolygon key={id} cameraId={id} projectId={projectId} layer={layer} />
      ))} */}
    </>
  )
}
