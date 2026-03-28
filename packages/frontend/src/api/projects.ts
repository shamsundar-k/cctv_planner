/*
 * FILE SUMMARY — src/api/projects.ts
 *
 * TanStack Query hooks for project CRUD operations and camera-model associations.
 *
 * useProject() — Fetches a single project by ID.
 * useProjects() — Fetches the full list of projects the current user can see.
 * useCreateProject() — Creates a new project.
 * useUpdateProject() — Updates an existing project.
 * useDeleteProject() — Deletes a project.
 * useImportedCameras() — Fetches the list of camera models imported into a project.
 * useAddCameraToProject() — Associates a global camera model with a project.
 * useRemoveCameraFromProject() — Removes a camera model from a project.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from './client'
import type { Project, ImportedCameraItem, CreateProjectDTO, UpdateProjectDTO } from './projects.types'
import type { CameraModel } from './cameras.types'
import { queryClient } from '../queryClient'

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

// ── Non-hook cache helpers ──────────────────────────────────────────────────────

export function getCameraModelDetails(id: string): CameraModel | undefined {
  const importedQueries = queryClient.getQueriesData<ImportedCameraItem[]>({ queryKey: ['importedCameras'] })
  for (const [, data] of importedQueries) {
    const found = data?.find((item) => item.camera_model.id === id)
    if (found) return found.camera_model
  }
  return undefined
}

// Re-export AxiosError for consumers
export type { AxiosError }
