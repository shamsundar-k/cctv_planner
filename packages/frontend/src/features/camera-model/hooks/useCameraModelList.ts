import { useAllCameraSpecs } from '@/api/cameraSpecs'

export function useCameraSpecList() {
  const { data: cameras = [], isLoading } = useAllCameraSpecs()

  return { cameras, isLoading }
}
