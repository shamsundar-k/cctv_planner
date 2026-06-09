import { useAllCameraSpecs } from '@/hooks/useCameraSpecs'

export function useCameraSpecList() {
  const { data: cameras = [], isLoading } = useAllCameraSpecs()

  return { cameras, isLoading }
}
