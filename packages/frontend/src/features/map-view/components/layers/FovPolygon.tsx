import { useEffect, type RefObject } from 'react'
import L from 'leaflet'
import { useCameraStore } from '@/store/cameraStore'
import { useLayerVisibilityStore } from '@/store/layerVisibilityStore'

interface FovPolygonProps {
  cameraId: string
  groupRef: RefObject<L.LayerGroup | null>
}

function cornersToLatLngs(geojson: object | null): L.LatLngExpression[] | null {
  if (!geojson || !Array.isArray(geojson) || geojson.length !== 4) return null
  const corners = geojson as Array<{ lat: number; lng: number }>
  if (!corners.every(c => typeof c?.lat === 'number' && typeof c?.lng === 'number')) return null
  return corners.map(c => [c.lat, c.lng] as L.LatLngExpression)
}

export default function FovPolygon({ cameraId, groupRef }: FovPolygonProps) {
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const fovPoly = L.polygon([], {
      weight: 1.5,
      opacity: 0.7,
      fillOpacity: 0.18,
    })

    const irPoly = L.polygon([], {
      weight: 1.5,
      opacity: 0.55,
      fillOpacity: 0.07,
      dashArray: '5 5',
    })

    function sync() {
      const cam = useCameraStore.getState().cameraRecords[cameraId]?.camera
      const { fov: fovVisible, ir: irVisible } = useLayerVisibilityStore.getState().visible

      if (!cam) return

      const fovLatLngs = cornersToLatLngs(cam.fov_visible_geojson)
      fovPoly.setLatLngs(fovLatLngs ?? [])
      fovPoly.setStyle({ color: cam.colour, fillColor: cam.colour })
      if (cam.visible && fovVisible && fovLatLngs) fovPoly.addTo(group)
      else fovPoly.remove()

      const irLatLngs = cornersToLatLngs(cam.fov_ir_geojson)
      irPoly.setLatLngs(irLatLngs ?? [])
      irPoly.setStyle({ color: cam.colour, fillColor: cam.colour })
      if (cam.visible && irVisible && irLatLngs) irPoly.addTo(group)
      else irPoly.remove()
    }

    sync()

    const unsubCamera = useCameraStore.subscribe(
      (s) => s.cameraRecords[cameraId]?.camera,
      () => sync(),
    )
    const unsubLayer = useLayerVisibilityStore.subscribe(
      (s) => s.visible,
      () => sync(),
    )

    return () => {
      unsubCamera()
      unsubLayer()
      fovPoly.remove()
      irPoly.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
