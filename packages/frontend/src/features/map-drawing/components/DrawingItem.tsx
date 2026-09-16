import { useEffect } from 'react'
import L from 'leaflet'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import { useMapDrawingStore } from '../store/store'
import { shapeFromEditedLayer } from '../utils/leafletEditing'
import { createLeafletDrawingLayer } from '../utils/leafletLayer'

interface DrawingItemProps {
  uid: string
  group: L.LayerGroup
}

export default function DrawingItem({ uid, group }: DrawingItemProps) {
  const drawing = useMapDrawingStore((state) => state.drawingRecords[uid]?.drawing)
  const selected = useMapDrawingStore((state) => state.selectedDrawingUid === uid)
  const selectDrawing = useMapDrawingStore((state) => state.selectDrawing)
  const updateDrawing = useMapDrawingStore((state) => state.updateDrawing)
  const isSelectMode = useMapActionsStore((state) => state.activeTool === 'select')

  useEffect(() => {
    if (!drawing?.visible) return
    const layer = createLeafletDrawingLayer(
      drawing.shape,
      drawing.style,
      selected,
      isSelectMode,
    ).addTo(group)

    const handleClick = (event: L.LeafletMouseEvent) => {
      event.originalEvent.stopPropagation()
      useCameraLayerStore.getState().clearSelection()
      selectDrawing(uid)
    }
    layer.on('click', handleClick)

    if (selected && layer instanceof L.Path) layer.bringToFront()

    const syncEditedShape = () => {
      const shape = shapeFromEditedLayer(drawing.shape, layer)
      if (shape) updateDrawing(uid, { shape })
    }

    if (selected && isSelectMode && !drawing.locked && layer.pm) {
      layer.on('pm:edit', syncEditedShape)
      layer.on('pm:dragend', syncEditedShape)
      layer.pm.enable({
        addVertexValidation: () => drawing.shape.shape_type !== 'rectangle',
        allowSelfIntersection: false,
        allowSelfIntersectionEdit: false,
        allowRemoval: false,
        draggable: true,
        preventMarkerRemoval: drawing.shape.shape_type === 'rectangle',
        removeVertexValidation: () => drawing.shape.shape_type !== 'rectangle',
        removeLayerBelowMinVertexCount: false,
      })
    }

    return () => {
      layer.off('click', handleClick)
      layer.off('pm:edit', syncEditedShape)
      layer.off('pm:dragend', syncEditedShape)
      if (layer.pm?.enabled()) layer.pm.disable()
      group.removeLayer(layer)
    }
  }, [drawing, group, isSelectMode, selectDrawing, selected, uid, updateDrawing])

  return null
}
