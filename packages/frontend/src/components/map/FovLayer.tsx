/**
 * FovLayer (FovPolygonLayer) — orchestrates per-camera FOV polygons.
 *
 * Subscribes only to `cameraIds` from the Zustand store, so it re-renders
 * only when a camera is added or removed — never when a camera's properties
 * change.  Each <FovPolygon> manages its own polygon and subscribes to its
 * own slice of the store.
 */
import L from 'leaflet'
import { useState, useEffect } from 'react'
import type { LayerGroup } from 'leaflet'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useCameraInstanceStore } from '../../store/cameraInstanceStore'
import FovPolygon from './FovPolygon'

interface FovLayerProps {
  projectId: string
}

export default function FovLayer({ projectId }: FovLayerProps) {
  const uids = useCameraInstanceStore((s) => s.uids)
  const map = useMapViewStore((s) => s.leafletMap)

  const [layer, setLayer] = useState<LayerGroup | null>(null)

  // ── Create / destroy the LayerGroup when the map becomes available ────────
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
      {uids.map((id) => (
        <FovPolygon key={id} cameraId={id} projectId={projectId} layer={layer} />
      ))}
    </>
  )
}
