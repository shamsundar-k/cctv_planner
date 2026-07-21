import L from 'leaflet'
import { useEffect, useState } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useCameraStore } from '@/store/cameraStore'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import CameraMarker from '@/features/map-view/components//CameraMarker'



/**
 * Purely visual layer. Manages the Leaflet LayerGroup lifecycle and
 * renders a CameraMarker per camera uid. Zero tool awareness.
 * @returns React fragment with CameraMarkers
 */
export default function CameraLayer() {
  const { mapRef } = useMapContext()
  const [group, setGroup] = useState<L.LayerGroup | null>(null)

  const uids = useCameraStore((s) => s.uids)
  const zoom = useMapActionsStore((s) => s.currentZoom)


  // Mount: create Leaflet group; unmount removes it
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const group = L.layerGroup().addTo(map)
    setGroup(group)
    console.log('CameraLayer initialized')

    return () => {
      group.remove()
      console.log('CameraLayer unmounted')
    }
  }, [mapRef])

  return (
    <>
      {uids.map((uid) => (
        group && <CameraMarker key={uid} cameraId={uid} group={group} zoom={zoom} />
      ))}
    </>
  )
}
