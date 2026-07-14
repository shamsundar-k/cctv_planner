import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CameraSpecCreate, CameraSpecRecord, CameraSpecUpdate } from '../types/camera'
import {
  createCameraSpec,
  deleteCameraSpec,
  fetchAllCameraSpecs,
  fetchCameraSpec,
  updateCameraSpec,
} from '../service/api/cameraSpecs'

export const cameraSpecKeys = {
  all: ['camera-specs'] as const,
  detail: (id: string) => ['camera-specs', id] as const,
}

export function useAllCameraSpecs() {
  return useQuery({
    queryKey: cameraSpecKeys.all,
    queryFn: fetchAllCameraSpecs,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCameraSpec(id: string) {
  return useQuery({
    queryKey: cameraSpecKeys.detail(id),
    queryFn: () => fetchCameraSpec(id),
    enabled: !!id && id !== 'new',
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCameraSpec() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CameraSpecCreate): Promise<CameraSpecRecord> => createCameraSpec(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraSpecKeys.all })
    },
    retry: 0,
  })
}

export function useUpdateCameraSpec() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CameraSpecUpdate }): Promise<CameraSpecRecord> =>
      updateCameraSpec(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cameraSpecKeys.all })
      queryClient.setQueryData(cameraSpecKeys.detail(data.id), data)
    },
    retry: 0,
  })
}

export function useDeleteCameraSpec() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string): Promise<void> => deleteCameraSpec(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cameraSpecKeys.all })
      const snapshot = queryClient.getQueryData<CameraSpecRecord[]>(cameraSpecKeys.all)
      queryClient.setQueryData<CameraSpecRecord[]>(cameraSpecKeys.all, (prev) =>
        prev ? prev.filter((camera) => camera.id !== id) : [],
      )
      return { snapshot }
    },
    onError: (_err, _id, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(cameraSpecKeys.all, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cameraSpecKeys.all })
    },
    retry: 0,
  })
}
