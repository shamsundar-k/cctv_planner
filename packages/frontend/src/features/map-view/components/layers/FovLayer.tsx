import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useCameraStore } from '@/store/cameraStore'
import FovPolygon from './FovPolygon'

export default function FovLayer() {
  const { mapRef } = useMapContext()
  const layerRef = useRef<L.LayerGroup | null>(null)
  const uids = useCameraStore((s) => s.uids)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const group = L.layerGroup().addTo(map)
    layerRef.current = group
    return () => {
      group.remove()
      layerRef.current = null
    }
  }, [mapRef]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {uids.map((uid) => (
        <FovPolygon key={uid} cameraId={uid} layerRef={layerRef} />
      ))}
    </>
  )
}
