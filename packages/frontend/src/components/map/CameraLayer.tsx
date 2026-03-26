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
import L from 'leaflet'
import { useState, useEffect } from 'react'
import type { LeafletMouseEvent, LayerGroup } from 'leaflet'
import type { CameraInstance } from '../../api/cameraInstances.types'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useCameraInstanceStore } from '../../store/cameraInstanceStore'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import { FOV_DEFAULTS } from '../../lib/fovCalculations'
import CameraMarker from './CameraMarker'

interface CameraLayerProps {
  projectId: string
}

export default function CameraLayer({ projectId }: CameraLayerProps) {
  const cameraIds = useCameraInstanceStore((s) => s.cameraIds)
  const addCamera = useCameraInstanceStore((s) => s.addCamera)

  const map = useMapViewStore((s) => s.leafletMap)
  const activeTool = useMapViewStore((s) => s.activeTool)
  const selectedModelId = useCameraLayerStore((s) => s.selectedModelId)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const clearSelection = useCameraLayerStore((s) => s.clearSelection)
  const setActiveTool = useMapViewStore((s) => s.setActiveTool)

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

  // ── Map click handler for camera interactions ────────────────────────────
  // Handles both camera placement (when place-camera tool active) and
  // deselection (when clicking map background with select/pan tools)
  useEffect(() => {
    if (!map) return

    const handler = (e: LeafletMouseEvent) => {
      if (activeTool === 'place-camera' && selectedModelId) {
        const tempId = 'temp-' + crypto.randomUUID()
        const now = new Date().toISOString()
        const localCamera: CameraInstance = {
          id: tempId,
          label: '',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          bearing: 0,
          height: FOV_DEFAULTS.height,
          tilt_angle: 30.0,
          focal_length_chosen: null,
          colour: '#3B82F6',
          visible: true,
          fov_visible_geojson: null,
          fov_ir_geojson: null,
          target_distance: FOV_DEFAULTS.targetDistance,
          target_height: FOV_DEFAULTS.targetHeight,
          camera_model_id: selectedModelId,
          project_id: projectId,
          created_at: now,
          updated_at: now,
        }
        addCamera(localCamera)
        selectCamera(tempId)
        setActiveTool('select')
      } else if (activeTool === 'select' || activeTool === 'pan') {
        // Deselect camera when clicking map background
        clearSelection()
      }
      // Other tools: no action
    }

    map.on('click', handler)
    return () => {
      map.off('click', handler)
    }
  }, [map, activeTool, selectedModelId, projectId, addCamera, selectCamera, clearSelection, setActiveTool])

  // ── Render one CameraMarker per ID ───────────────────────────────────────
  // React mounts/unmounts each CameraMarker when IDs are added/removed.
  return (
    <>
      {cameraIds.map((id) => (
        <CameraMarker key={id} cameraId={id} layer={layer} />
      ))}
    </>
  )
}
