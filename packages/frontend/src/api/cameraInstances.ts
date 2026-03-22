/*
 * FILE SUMMARY — src/api/cameraInstances.ts
 *
 * TanStack Query hooks for camera instance operations within a project.
 * Camera instances represent physical camera placements on the map.
 *
 * useCameraInstances(projectId)      — GET  /projects/:id/cameras
 * useCreateCameraInstance(projectId) — POST /projects/:id/cameras
 * useUpdateCameraInstance(projectId) — PUT  /projects/:id/cameras/:camId
 * useDeleteCameraInstance(projectId) — DELETE /projects/:id/cameras/:camId
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CameraInstance {
  id: string
  label: string
  lat: number
  lng: number
  bearing: number
  height: number
  tilt_angle: number
  focal_length_chosen: number | null
  colour: string
  visible: boolean
  fov_visible_geojson: object | null
  fov_ir_geojson: object | null
  target_distance: number | null
  target_height: number
  camera_model_id: string
  project_id: string
  created_at: string
  updated_at: string
}

// ── Payload types ──────────────────────────────────────────────────────────────

export interface CameraInstanceCreatePayload {
  camera_model_id: string
  label?: string
  lat: number
  lng: number
  bearing?: number
  height?: number
  tilt_angle?: number
  focal_length_chosen?: number | null
  colour?: string
  visible?: boolean
  fov_visible_geojson?: object | null
  fov_ir_geojson?: object | null
  target_distance?: number | null
  target_height?: number
}

export interface CameraInstanceUpdatePayload {
  label?: string
  lat?: number
  lng?: number
  bearing?: number
  height?: number
  tilt_angle?: number
  focal_length_chosen?: number | null
  colour?: string
  visible?: boolean
  fov_visible_geojson?: object | null
  fov_ir_geojson?: object | null
  target_distance?: number | null
  target_height?: number
}

// ── Query keys ─────────────────────────────────────────────────────────────────

export const cameraInstanceKeys = {
  list: (projectId: string) => ['cameraInstances', projectId] as const,
  detail: (projectId: string, cameraId: string) => ['cameraInstances', projectId, cameraId] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useCameraInstances(projectId: string) {
  return useQuery({
    queryKey: cameraInstanceKeys.list(projectId),
    queryFn: async (): Promise<CameraInstance[]> => {
      const res = await client.get<CameraInstance[]>(`/projects/${projectId}/cameras`)
      return res.data
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCameraInstance(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CameraInstanceCreatePayload): Promise<CameraInstance> => {
      const res = await client.post<CameraInstance>(`/projects/${projectId}/cameras`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraInstanceKeys.list(projectId) })
    },
  })
}

export function useUpdateCameraInstance(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ cameraId, data }: { cameraId: string; data: CameraInstanceUpdatePayload }): Promise<CameraInstance> => {
      const res = await client.put<CameraInstance>(`/projects/${projectId}/cameras/${cameraId}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraInstanceKeys.list(projectId) })
    },
  })
}

export function useDeleteCameraInstance(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cameraId: string): Promise<void> => {
      await client.delete(`/projects/${projectId}/cameras/${cameraId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraInstanceKeys.list(projectId) })
    },
  })
}
