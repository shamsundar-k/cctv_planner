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
import { useMapViewStore } from '../../store/mapViewSlice'
import { useCameraInstanceStore } from '../../store/cameraInstanceStore'
import { generateDefaultCameraInstance } from '../../lib/cameraGenerator'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'

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

  type geo_position =
    {
      lat: number,
      lng: number

    }

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

        console.log("selected model", selectedModelId)
        const position: geo_position = { lat: e.latlng.lat, lng: e.latlng.lng }
        const localCamera = generateDefaultCameraInstance(selectedModelId, position, projectId);
        addCamera(localCamera)
        selectCamera(localCamera.id)
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
