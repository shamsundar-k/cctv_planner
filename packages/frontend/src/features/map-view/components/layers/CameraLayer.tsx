import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import { useCameraInstanceStore } from '@/store/cameraInstanceStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { useSelectedCameraModelStore } from '@/store/selectedCameraModelSlice'
import { generateDefaultCameraInstance } from '@/lib/cameraGenerator'
import CameraMarker from '@/features/map-view/components//CameraMarker'

interface CameraLayerProps {
  projectId: string
}

export default function CameraLayer({ projectId }: CameraLayerProps) {
  const { mapRef } = useMapContext()
  const groupRef = useRef<L.LayerGroup | null>(null)

  const uids = useCameraInstanceStore((s) => s.uids)
  const addCamera = useCameraInstanceStore((s) => s.addCamera)
  const activeTool = useMapActionsStore((s) => s.activeTool)
  const selectedCameraModel = useSelectedCameraModelStore((s) => s.selectedCameraModel)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const clearSelection = useCameraLayerStore((s) => s.clearSelection)

  // Refs so the click handler always reads current values without re-registering
  const activeToolRef = useRef(activeTool)
  const selectedCameraModelRef = useRef(selectedCameraModel)
  const addCameraRef = useRef(addCamera)
  const selectCameraRef = useRef(selectCamera)
  const clearSelectionRef = useRef(clearSelection)
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  useEffect(() => { selectedCameraModelRef.current = selectedCameraModel }, [selectedCameraModel])
  useEffect(() => { addCameraRef.current = addCamera }, [addCamera])
  useEffect(() => { selectCameraRef.current = selectCamera }, [selectCamera])
  useEffect(() => { clearSelectionRef.current = clearSelection }, [clearSelection])

  // Mount: create Leaflet group; unmount removes it
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const group = L.layerGroup().addTo(map)
    groupRef.current = group
    console.log('CameraLayer initialized')

    return () => {
      group.remove()
      groupRef.current = null
    }
  }, [mapRef]) // eslint-disable-line react-hooks/exhaustive-deps

  // Map click: place camera or clear selection — registered once, reads current values via refs
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handler = (e: L.LeafletMouseEvent) => {
      if (activeToolRef.current === 'place-camera' && selectedCameraModelRef.current) {
        const localCamera = generateDefaultCameraInstance(
          selectedCameraModelRef.current.id,
          { lat: e.latlng.lat, lng: e.latlng.lng },
          projectId,
        )
        if (localCamera) {
          const uid = addCameraRef.current(localCamera)
          selectCameraRef.current(uid)
        }
      } else if (activeToolRef.current === 'select' || activeToolRef.current === 'pan') {
        clearSelectionRef.current()
      }
    }

    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, []) // mapRef and projectId are stable — handler reads all other values via refs

  return (
    <>
      {uids.map((uid) => (
        <CameraMarker key={uid} cameraId={uid} groupRef={groupRef} />
      ))}
    </>
  )
}