/*
 * FILE SUMMARY — src/api/cameras.ts
 *
 * TanStack Query hooks for the global camera-model catalogue. All hooks use
 * the shared Axios client and the `cameraKeys` cache-key namespace.
 *
 * useAllCameras() — Query hook; fetches the full catalogue from
 *   GET /camera-models. Stale after 2 min, evicted after 10 min. Used by the
 *   admin camera list page and the ImportedCamerasTab.
 *
 * useCamera(id) — Query hook; fetches a single camera model from
 *   GET /camera-models/:id. Only enabled when `id` is truthy and not "new".
 *   Stale after 2 min.
 *
 * useCreateCamera() — Mutation hook; POSTs a CameraModelCreate payload to
 *   /camera-models. On success, invalidates the full camera list cache.
 *
 * useUpdateCamera() — Mutation hook; sends PUT /camera-models/:id with a
 *   CameraModelUpdate partial payload. On success, invalidates the list cache
 *   and writes the updated model directly into the detail cache entry.
 *
 * useDeleteCamera() — Mutation hook; sends DELETE /camera-models/:id. Uses
 *   optimistic update: removes the camera from the list cache immediately,
 *   rolls back on error, then invalidates the list on settle.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'

// ── Types ──────────────────────────────────────────────────────────────────────

export type CameraType = 'fixed_dome' | 'ptz' | 'bullet'
export type LensType = 'fixed' | 'varifocal'
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

export function useAllCameras() {
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

export function useCamera(id: string) {
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
