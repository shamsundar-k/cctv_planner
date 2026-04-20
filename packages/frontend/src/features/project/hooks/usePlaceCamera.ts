import { useCameraPlacementStore } from '../../../store/cameraPlacementSlice'
import { useMapInteractionStore } from '../../../store/mapInteractionSlice'
import type { CameraModel } from '../../../types/cameramodel.types'

export function usePlaceCamera() {
  const { setSelectedCameraId, setSelectedModel } = useCameraPlacementStore()
  const setMode = useMapInteractionStore((s) => s.setMode)

  return (model: CameraModel) => {
    setSelectedModel({ manufacturer: model.manufacturer, model: model.model_number })
    setSelectedCameraId(model.id)
    setMode('PLACING')
  }
}
