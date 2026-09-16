import { useEffect, useState } from 'react'
import L from 'leaflet'
import { useMapContext } from '@/context/MapContext'
import { useLayerVisibilityStore } from '@/store/layerVisibilityStore'
import { useMapDrawingStore } from '../store/store'
import DrawingItem from './DrawingItem'

export default function DrawingLayer() {
  const { mapRef } = useMapContext()
  const [group, setGroup] = useState<L.LayerGroup | null>(null)
  const uids = useMapDrawingStore((state) => state.uids)
  const isVisible = useLayerVisibilityStore((state) => state.visible.draw)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const drawingGroup = L.layerGroup().addTo(map)
    setGroup(drawingGroup)
    return () => {
      drawingGroup.remove()
    }
  }, [mapRef])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !group) return
    if (isVisible && !map.hasLayer(group)) group.addTo(map)
    if (!isVisible && map.hasLayer(group)) group.removeFrom(map)
  }, [group, isVisible, mapRef])

  return (
    <>
      {group && uids.map((uid) => (
        <DrawingItem key={uid} uid={uid} group={group} />
      ))}
    </>
  )
}
