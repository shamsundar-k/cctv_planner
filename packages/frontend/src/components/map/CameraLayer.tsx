/**
 * CameraLayer (CameraMarkerLayer) — orchestrates per-camera markers.
 *
 * Subscribes only to `cameraIds` from the Zustand store, so it re-renders
 * only when a camera is added or removed — never when a camera's properties
 * change.  Each <CameraMarker> manages its own marker and subscribes to its
 * own slice of the store.
 *
 * Also handles map-click events when the "place-camera" tool is active.
 */
import { useEffect } from 'react'
import type { LeafletMouseEvent } from 'leaflet'
import { useCreateCameraInstance } from '../../api/cameraInstances'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useCameraInstanceStore } from '../../store/cameraInstanceStore'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import { useLeafletMap } from './MapContext'
import { FOV_DEFAULTS } from '../../lib/fovCalculations'
import CameraMarker from './CameraMarker'

interface CameraLayerProps {
  projectId: string
}

export default function CameraLayer({ projectId }: CameraLayerProps) {
  const cameraIds = useCameraInstanceStore((s) => s.cameraIds)
  const createCamera = useCreateCameraInstance(projectId)

  const map = useLeafletMap()
  const activeTool = useMapViewStore((s) => s.activeTool)
  const selectedModelId = useCameraLayerStore((s) => s.selectedModelId)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const setActiveTool = useMapViewStore((s) => s.setActiveTool)

  // ── Map click handler for camera placement ────────────────────────────────
  useEffect(() => {
    if (!map || activeTool !== 'place-camera' || !selectedModelId) return

    const handler = (e: LeafletMouseEvent) => {
      createCamera.mutate(
        {
          camera_model_id: selectedModelId,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          height: FOV_DEFAULTS.height,
          target_distance: FOV_DEFAULTS.targetDistance,
          target_height: FOV_DEFAULTS.targetHeight,
        },
        { onSuccess: (newCamera) => { selectCamera(newCamera.id); setActiveTool('select') } },
      )
    }

    map.on('click', handler)
    return () => {
      map.off('click', handler)
    }
  }, [map, activeTool, selectedModelId, createCamera, selectCamera, setActiveTool])

  // ── Render one CameraMarker per ID ───────────────────────────────────────
  // React mounts/unmounts each CameraMarker when IDs are added/removed.
  return (
    <>
      {cameraIds.map((id) => (
        <CameraMarker key={id} cameraId={id} />
      ))}
    </>
  )
}
