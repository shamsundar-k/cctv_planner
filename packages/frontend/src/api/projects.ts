import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from './client'
import type { CameraModel } from './cameras'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Collaborator {
  user_id: string
  role: 'editor' | 'viewer'
}

export interface Project {
  id: string
  name: string
  description: string
  owner_id: string
  collaborators: Collaborator[]
  center_lat: number | null
  center_lng: number | null
  default_zoom: number | null
  camera_count: number
  zone_count: number
  imported_camera_model_count: number
  created_at: string
  updated_at: string
}

export interface ImportedCameraItem {
  camera_model: CameraModel
  placed_count: number
}

export interface CreateProjectDTO {
  name: string
  description?: string
  center_lat?: number | null
  center_lng?: number | null
  default_zoom?: number | null
}

export interface UpdateProjectDTO {
  name?: string
  description?: string
  center_lat?: number | null
  center_lng?: number | null
  default_zoom?: number | null
}

// ── Query keys ─────────────────────────────────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
  importedCameras: (id: string) => ['importedCameras', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async (): Promise<Project> => {
      const res = await client.get<Project>(`/projects/${id}`)
      return res.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: async (): Promise<Project[]> => {
      const res = await client.get<Project[]>('/projects')
      return res.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProjectDTO): Promise<Project> => {
      const res = await client.post<Project>('/projects', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      updates,
    }: {
      projectId: string
      updates: UpdateProjectDTO
    }): Promise<Project> => {
      const res = await client.put<Project>(`/projects/${projectId}`, updates)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      await client.delete(`/projects/${projectId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useImportedCameras(projectId: string) {
  return useQuery({
    queryKey: projectKeys.importedCameras(projectId),
    queryFn: async (): Promise<ImportedCameraItem[]> => {
      const res = await client.get<ImportedCameraItem[]>(`/projects/${projectId}/camera-models`)
      return res.data
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAddCameraToProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      modelId,
    }: {
      projectId: string
      modelId: string
    }): Promise<ImportedCameraItem> => {
      const res = await client.post<ImportedCameraItem>(`/projects/${projectId}/camera-models/${modelId}`)
      return res.data
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.importedCameras(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useRemoveCameraFromProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      modelId,
    }: {
      projectId: string
      modelId: string
    }): Promise<void> => {
      await client.delete(`/projects/${projectId}/camera-models/${modelId}`)
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.importedCameras(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

// Re-export AxiosError for consumers
export type { AxiosError }
