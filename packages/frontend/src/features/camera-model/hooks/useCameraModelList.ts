import { useAllCameraModels } from '../../../api/camerasModels'

export function useCameraModelList() {
  const { data: cameras = [], isLoading } = useAllCameraModels()

  return { cameras, isLoading }
}
