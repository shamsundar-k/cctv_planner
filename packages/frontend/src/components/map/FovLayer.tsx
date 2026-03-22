/**
 * FovLayer — renders FOV trapezoid polygons on the Leaflet map for each
 * camera that has a valid FOV configuration.
 *
 * Renders no DOM of its own; all output goes directly into the Leaflet map.
 * Respects the `showFovPolygons` toggle and per-camera `hiddenCameraIds`
 * from the map view store.
 */
import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Polygon } from 'leaflet'
import { useCameraInstances } from '../../api/cameraInstances'
import { useImportedCameras } from '../../api/projects'
import { useMapViewStore } from '../../store/mapViewSlice'
import {
  calculateFov,
  calculateTiltFromTarget,
  projectTrapezoidToLatLng,
} from '../../lib/fovCalculations'

interface FovLayerProps {
  projectId: string
  map: LeafletMap | null
}

export default function FovLayer({ projectId, map }: FovLayerProps) {
  const { data: cameras } = useCameraInstances(projectId)
  const { data: importedItems } = useImportedCameras(projectId)

  const showFovPolygons = useMapViewStore((s) => s.showFovPolygons)
  const hiddenCameraIds = useMapViewStore((s) => s.hiddenCameraIds)
  const selectedCameraId = useMapViewStore((s) => s.selectedCameraId)

  const polygonsRef = useRef<Map<string, Polygon>>(new Map())

  // ── Sync polygons with camera list ─────────────────────────────────────────
  useEffect(() => {
    if (!map || !cameras || !importedItems) return

    import('leaflet').then((L) => {
      const existing = polygonsRef.current
      const currentIds = new Set(cameras.map((c) => c.id))

      // Remove polygons for deleted cameras
      for (const [id, polygon] of existing) {
        if (!currentIds.has(id)) {
          polygon.remove()
          existing.delete(id)
        }
      }

      for (const cam of cameras) {
        const shouldHide =
          !showFovPolygons ||
          hiddenCameraIds.includes(cam.id) ||
          !cam.target_distance ||
          cam.target_distance <= 0

        if (shouldHide) {
          existing.get(cam.id)?.remove()
          existing.delete(cam.id)
          continue
        }

        const cameraModel =
          importedItems.find((item) => item.camera_model.id === cam.camera_model_id)
            ?.camera_model ?? null

        if (!cameraModel) {
          existing.get(cam.id)?.remove()
          existing.delete(cam.id)
          continue
        }

        const tiltAngle = calculateTiltFromTarget(
          cam.height,
          cam.target_distance,
          cam.target_height,
        )

        const result = calculateFov({
          focalLengthMin: cameraModel.focal_length_min,
          focalLengthMax: cameraModel.focal_length_max,
          hFovMin: cameraModel.h_fov_min,
          hFovMax: cameraModel.h_fov_max,
          vFovMin: cameraModel.v_fov_min,
          vFovMax: cameraModel.v_fov_max,
          installationHeight: cam.height,
          tiltAngle,
          focalLengthChosen: cam.focal_length_chosen ?? cameraModel.focal_length_min,
        })

        if (!result.valid) {
          existing.get(cam.id)?.remove()
          existing.delete(cam.id)
          continue
        }

        const latlngs = projectTrapezoidToLatLng(
          result.trapezoid,
          cam.lat,
          cam.lng,
          cam.bearing,
        )

        const isSelected = cam.id === selectedCameraId
        const style = {
          color: cam.colour,
          fillColor: cam.colour,
          fillOpacity: isSelected ? 0.30 : 0.15,
          weight: isSelected ? 2.0 : 1.5,
          opacity: isSelected ? 1.0 : 0.8,
        }

        if (existing.has(cam.id)) {
          const polygon = existing.get(cam.id)!
          polygon.setLatLngs(latlngs)
          polygon.setStyle(style)
        } else {
          const polygon = L.polygon(latlngs, style).addTo(map)
          existing.set(cam.id, polygon)
        }
      }
    })
  }, [cameras, importedItems, map, showFovPolygons, hiddenCameraIds, selectedCameraId])

  // ── Clean up all polygons on unmount ───────────────────────────────────────
  useEffect(() => {
    const polygons = polygonsRef.current
    return () => {
      for (const polygon of polygons.values()) {
        polygon.remove()
      }
      polygons.clear()
    }
  }, [])

  return null
}
