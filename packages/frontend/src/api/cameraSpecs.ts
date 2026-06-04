import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'
import type { CameraSpec, CameraSpecRecord, CameraSpecUpdate } from '@/types/camera'

export const cameraSpecKeys = {
  all: ['camera-specs'] as const,
  detail: (id: string) => ['camera-specs', id] as const,
}

export function useAllCameraSpecs() {
  return useQuery({
    queryKey: cameraSpecKeys.all,
    queryFn: async (): Promise<CameraSpecRecord[]> => {
      const res = await client.get<CameraSpecRecord[]>('/camera-specs')
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCameraSpec(id: string) {
  return useQuery({
    queryKey: cameraSpecKeys.detail(id),
    queryFn: async (): Promise<CameraSpecRecord> => {
      const res = await client.get<CameraSpecRecord>(`/camera-specs/${id}`)
      return res.data
    },
    enabled: !!id && id !== 'new',
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCameraSpec() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CameraSpec): Promise<CameraSpecRecord> => {
      const res = await client.post<CameraSpecRecord>('/camera-specs', body)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraSpecKeys.all })
    },
    retry: 0,
  })
}

export function useUpdateCameraSpec() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: CameraSpecUpdate }): Promise<CameraSpecRecord> => {
      const res = await client.put<CameraSpecRecord>(`/camera-specs/${id}`, body)
      return res.data
    },
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
    mutationFn: async (id: string): Promise<void> => {
      await client.delete(`/camera-specs/${id}`)
    },
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
