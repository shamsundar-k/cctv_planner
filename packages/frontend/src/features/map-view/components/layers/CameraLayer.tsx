import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useCameraStore } from '@/store/cameraStore'
import CameraMarker from '@/features/map-view/components//CameraMarker'

interface CameraLayerProps {
  projectId: string
}

/**
 * Purely visual layer. Manages the Leaflet LayerGroup lifecycle and
 * renders a CameraMarker per camera uid. Zero tool awareness.
 */
export default function CameraLayer({ projectId: _projectId }: CameraLayerProps) {
  const { mapRef } = useMapContext()
  const groupRef = useRef<L.LayerGroup | null>(null)

  const uids = useCameraStore((s) => s.uids)

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

  return (
    <>
      {uids.map((uid) => (
        <CameraMarker key={uid} cameraId={uid} groupRef={groupRef} />
      ))}
    </>
  )
}