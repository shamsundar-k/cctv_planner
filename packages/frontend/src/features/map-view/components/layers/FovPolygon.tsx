import { useEffect, type RefObject } from 'react'
import L from 'leaflet'
import { useCameraStore } from '@/store/cameraStore'
import { useLayerVisibilityStore } from '@/store/layerVisibilityStore'

interface FovPolygonProps {
  cameraId: string
  layerRef: RefObject<L.LayerGroup | null>
}

export default function FovPolygon({ cameraId, layerRef }: FovPolygonProps) {
  const camera = useCameraStore((s) => s.cameraRecords[cameraId]?.camera)
  const visible = useLayerVisibilityStore((s) => s.visible)

  useEffect(() => {
    const group = layerRef.current
    if (!group || !camera) return

    const fovPoly = L.polygon([], { weight: 1.5, opacity: 0.7, fillOpacity: 0.18 })

    const fovLatLngs: L.LatLngExpression[] | null = camera.coverage_area
      ? camera.coverage_area.points.map((point) => [point.latitude, point.longitude])
      : null
    fovPoly.setLatLngs(fovLatLngs ?? [])
    fovPoly.setStyle({ color: camera.color, fillColor: camera.color })
    if (visible.fov && fovLatLngs) fovPoly.addTo(group)

    return () => {
      fovPoly.remove()
    }
  }, [camera, visible])

  return null
}
