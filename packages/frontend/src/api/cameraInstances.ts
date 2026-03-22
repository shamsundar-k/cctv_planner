/*
 * FILE SUMMARY — src/api/cameraInstances.ts
 *
 * TanStack Query hooks for camera instance operations within a project.
 * Camera instances represent physical camera placements on the map.
 *
 * useCameraInstances(projectId) — Query hook; fetches all placed cameras for
 *   a project from GET /projects/:id/cameras. Stale after 2 min.
 */
import { useQuery } from '@tanstack/react-query'
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

// ── Query keys ─────────────────────────────────────────────────────────────────

export const cameraInstanceKeys = {
  list: (projectId: string) => ['cameraInstances', projectId] as const,
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
