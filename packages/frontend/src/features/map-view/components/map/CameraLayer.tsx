import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useMapViewStore } from '@/store/mapViewSlice'
import { useCameraInstanceStore } from '@/store/cameraInstanceStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { useSelectedCameraModelStore } from '@/store/selectedCameraModelSlice'
import { generateDefaultCameraInstance } from '@/lib/cameraGenerator'
import CameraMarker from './CameraMarker'

interface CameraLayerProps {
  projectId: string
}

export default function CameraLayer({ projectId }: CameraLayerProps) {
  const { mapRef } = useMapContext()
  const groupRef = useRef<L.LayerGroup | null>(null)

  const uids = useCameraInstanceStore((s) => s.uids)
  const addCamera = useCameraInstanceStore((s) => s.addCamera)
  const activeTool = useMapViewStore((s) => s.activeTool)
  const selectedCameraModel = useSelectedCameraModelStore((s) => s.selectedCameraModel)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const clearSelection = useCameraLayerStore((s) => s.clearSelection)

  // Mount: create Leaflet group; unmount removes it
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

  // Map click: place camera or clear selection
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handler = (e: L.LeafletMouseEvent) => {
      if (activeTool === 'place-camera' && selectedCameraModel) {
        const localCamera = generateDefaultCameraInstance(
          selectedCameraModel.id,
          { lat: e.latlng.lat, lng: e.latlng.lng },
          projectId,
        )
        if (localCamera) {
          const uid = addCamera(localCamera)
          selectCamera(uid)
        }
      } else if (activeTool === 'select' || activeTool === 'pan') {
        clearSelection()
      }
    }

    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [activeTool, selectedCameraModel, projectId, addCamera, selectCamera, clearSelection]) // mapRef is a stable ref — intentionally omitted

  return (
    <>
      {uids.map((uid) => (
        <CameraMarker key={uid} cameraId={uid} groupRef={groupRef} />
      ))}
    </>
  )
}