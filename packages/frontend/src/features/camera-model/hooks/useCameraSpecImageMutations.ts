import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CameraSpecRecord } from '@/types/camera'
import { cameraSpecKeys } from '@/hooks/useCameraSpecs'
import { removeCameraSpecImage, replaceCameraSpecImage } from '../api/cameraSpecImages'

function useSyncCameraSpecImage() {
  const queryClient = useQueryClient()

  return (camera: CameraSpecRecord) => {
    queryClient.setQueryData(cameraSpecKeys.detail(camera.id), camera)
    queryClient.invalidateQueries({ queryKey: cameraSpecKeys.all })
  }
}

export function useReplaceCameraSpecImage() {
  const syncCameraSpecImage = useSyncCameraSpecImage()

  return useMutation({
    mutationFn: ({ id, image }: { id: string; image: File }) =>
      replaceCameraSpecImage(id, image),
    onSuccess: syncCameraSpecImage,
    retry: 0,
  })
}

export function useRemoveCameraSpecImage() {
  const syncCameraSpecImage = useSyncCameraSpecImage()

  return useMutation({
    mutationFn: (id: string) => removeCameraSpecImage(id),
    onSuccess: syncCameraSpecImage,
    retry: 0,
  })
}
