import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useMapViewStore } from '@/store/mapViewSlice'
import { useCameraInstanceStore } from '@/store/cameraInstanceStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { useLayerRegistryStore } from '@/store/layerRegistryStore'
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
  const setActiveTool = useMapViewStore((s) => s.setActiveTool)
  const selectedModel = useCameraLayerStore((s) => s.selectedModel)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const clearSelection = useCameraLayerStore((s) => s.clearSelection)

  const { registerLayer, unregisterLayer } = useLayerRegistryStore.getState()

  // Mount: create group, register layer, subscribe to visibility changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const group = L.layerGroup().addTo(map)
    groupRef.current = group
    registerLayer('cameras', 'Cameras')

    const unsub = useLayerRegistryStore.subscribe(
      (s) => s.layers['cameras']?.visible,
      (visible) => {
        if (visible === undefined) return
        visible ? map.addLayer(group) : map.removeLayer(group)
      }
    )

    return () => {
      unsub()
      unregisterLayer('cameras')
      group.remove()
      groupRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Map click: place camera or clear selection
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handler = (e: L.LeafletMouseEvent) => {
      if (activeTool === 'place-camera' && selectedModel) {
        const localCamera = generateDefaultCameraInstance(
          selectedModel.id,
          { lat: e.latlng.lat, lng: e.latlng.lng },
          projectId,
        )
        if (localCamera) {
          const uid = addCamera(localCamera)
          selectCamera(uid)
          setActiveTool('select')
        }
      } else if (activeTool === 'select' || activeTool === 'pan') {
        clearSelection()
      }
    }

    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [activeTool, selectedModel, projectId, addCamera, selectCamera, clearSelection, setActiveTool]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {uids.map((id) => (
        <CameraMarker key={id} cameraId={id} groupRef={groupRef} />
      ))}
    </>
  )
}
