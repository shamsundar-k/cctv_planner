/**
 * FovPolygon — manages one Leaflet FOV polygon for one camera.
 *
 * Subscribes to `cameraRecords[cameraId].camera` in the Zustand store so it only
 * re-renders when *this* camera's data changes.  The imported camera-model
 * list comes from React Query's shared cache (no extra fetch per instance).
 */
import { useEffect, useRef } from 'react'
import type { Polygon, LayerGroup } from 'leaflet'
import { useImportedCameras } from '../../api/projects'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useCameraInstanceStore } from '../../store/cameraInstanceStore'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import {
  calculateFov,
  calculateTiltFromTarget,
  projectTrapezoidToLatLng,
} from '../../lib/fovCalculations'

interface FovPolygonProps {
  cameraId: string
  projectId: string
  layer: LayerGroup | null
}

export default function FovPolygon({ cameraId, projectId, layer }: FovPolygonProps) {
  const camera = useCameraInstanceStore((s) => s.cameraRecords[cameraId]?.camera)
  const selectedCameraId = useCameraLayerStore((s) => s.selectedCameraId)
  const hiddenCameraIds = useCameraLayerStore((s) => s.hiddenCameraIds)
  const showFovPolygons = useMapViewStore((s) => s.showFovPolygons)

  const { data: importedItems } = useImportedCameras(projectId)

  const polygonRef = useRef<Polygon | null>(null)

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      polygonRef.current?.remove()
      polygonRef.current = null
    }
  }, [])

  // ── Sync polygon with camera state ───────────────────────────────────────
  useEffect(() => {
    if (!layer || !camera || !importedItems) return

    const shouldHide =
      !showFovPolygons ||
      hiddenCameraIds.includes(cameraId) ||
      !camera.target_distance ||
      camera.target_distance <= 0

    if (shouldHide) {
      polygonRef.current?.remove()
      polygonRef.current = null
      return
    }

    const cameraModel =
      importedItems.find((item) => item.camera_model.id === camera.camera_model_id)
        ?.camera_model ?? null

    if (!cameraModel) {
      polygonRef.current?.remove()
      polygonRef.current = null
      return
    }

    const tiltAngle = calculateTiltFromTarget(
      camera.camera_height,
      camera.target_distance!,
      camera.target_height,
    )

    const result = calculateFov({
      focalLengthMin: cameraModel.focal_length_min,
      focalLengthMax: cameraModel.focal_length_max,
      hFovMin: cameraModel.h_fov_min,
      hFovMax: cameraModel.h_fov_max,
      vFovMin: cameraModel.v_fov_min,
      vFovMax: cameraModel.v_fov_max,
      installationHeight: camera.camera_height,
      tiltAngle,
      focalLengthChosen: camera.focal_length_chosen ?? cameraModel.focal_length_min,
    })

    if (!result.valid) {
      polygonRef.current?.remove()
      polygonRef.current = null
      return
    }

    const latlngs = projectTrapezoidToLatLng(
      result.trapezoid,
      camera.lat,
      camera.lng,
      camera.bearing,
    )

    const isSelected = cameraId === selectedCameraId
    const style = {
      color: camera.colour,
      fillColor: camera.colour,
      fillOpacity: isSelected ? 0.30 : 0.15,
      weight: isSelected ? 2.0 : 1.5,
      opacity: isSelected ? 1.0 : 0.8,
    }

    import('leaflet').then((L) => {
      if (polygonRef.current) {
        polygonRef.current.setLatLngs(latlngs)
        polygonRef.current.setStyle(style)
      } else {
        polygonRef.current = L.polygon(latlngs, style).addTo(layer)
      }
    })
  }, [camera, selectedCameraId, showFovPolygons, hiddenCameraIds, importedItems, layer])

  return null
}
