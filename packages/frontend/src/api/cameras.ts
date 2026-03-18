import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'

// ── Types ──────────────────────────────────────────────────────────────────────

export type CameraType = 'fixed_dome' | 'ptz' | 'bullet'
export type LensType = 'fixed' | 'varifocal' | 'optical_zoom'
export type SensorType = 'cmos'

export interface CameraModel {
  id: string
  name: string
  manufacturer: string
  model_number: string
  camera_type: CameraType
  location: string
  notes: string | null

  focal_length_min: number
  focal_length_max: number
  h_fov_min: number
  h_fov_max: number
  v_fov_min: number
  v_fov_max: number
  lens_type: LensType
  ir_cut_filter: boolean
  ir_range: number

  resolution_h: number
  resolution_v: number
  megapixels: number
  aspect_ratio: string
  sensor_size: string | null
  sensor_type: SensorType
  min_illumination: number
  wdr: boolean
  wdr_db: number | null

  created_by: string
  created_at: string
  updated_at: string
}

export type CameraModelCreate = Omit<CameraModel, 'id' | 'megapixels' | 'aspect_ratio' | 'created_by' | 'created_at' | 'updated_at' | 'notes' | 'sensor_size'> & {
  megapixels?: number
  aspect_ratio?: string
  notes: string | null
  sensor_size: string | null
}

export type CameraModelUpdate = Partial<CameraModelCreate>

// ── Query keys ─────────────────────────────────────────────────────────────────

export const cameraKeys = {
  all: ['cameras'] as const,
  detail: (id: string) => ['cameras', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useAdminCameras() {
  return useQuery({
    queryKey: cameraKeys.all,
    queryFn: async (): Promise<CameraModel[]> => {
      const res = await client.get<CameraModel[]>('/camera-models')
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useAdminCamera(id: string) {
  return useQuery({
    queryKey: cameraKeys.detail(id),
    queryFn: async (): Promise<CameraModel> => {
      const res = await client.get<CameraModel>(`/camera-models/${id}`)
      return res.data
    },
    enabled: !!id && id !== 'new',
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCamera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CameraModelCreate): Promise<CameraModel> => {
      const res = await client.post<CameraModel>('/camera-models', body)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
    },
    retry: 0,
  })
}

export function useUpdateCamera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: CameraModelUpdate }): Promise<CameraModel> => {
      const res = await client.put<CameraModel>(`/camera-models/${id}`, body)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
      queryClient.setQueryData(cameraKeys.detail(data.id), data)
    },
    retry: 0,
  })
}

export function useDeleteCamera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await client.delete(`/camera-models/${id}`)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cameraKeys.all })
      const snapshot = queryClient.getQueryData<CameraModel[]>(cameraKeys.all)
      queryClient.setQueryData<CameraModel[]>(cameraKeys.all, (prev) =>
        prev ? prev.filter((c) => c.id !== id) : [],
      )
      return { snapshot }
    },
    onError: (_err, _id, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(cameraKeys.all, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
    },
    retry: 0,
  })
}
