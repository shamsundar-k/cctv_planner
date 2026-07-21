import L from 'leaflet'
import { useEffect, useState } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useCameraStore } from '@/store/cameraStore'
import FovPolygon from './FovPolygon'

export default function FovLayer() {
  const { mapRef } = useMapContext()
  const [layer, setLayer] = useState<L.LayerGroup | null>(null)
  const uids = useCameraStore((s) => s.uids)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const group = L.layerGroup().addTo(map)
    setLayer(group)
    console.log('FovLayer initialized')
    return () => {
      group.remove()
      console.log('FovLayer unmounted')
    }
  }, [mapRef])

  return (
    <>
      {uids.map((uid) => (
        layer && <FovPolygon key={uid} cameraId={uid} layer={layer} />
      ))}
    </>
  )
}
