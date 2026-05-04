import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from './client'
import type { Project, CreateProjectDTO, UpdateProjectDTO } from './projects.types'
import type { CameraModel } from '../types/cameramodel.types'
import { queryClient } from '../queryClient'
import { cameraKeys } from './camerasModels'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
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

// ── Non-hook cache helpers ──────────────────────────────────────────────────────

export function getCameraModelDetails(id: string): CameraModel | undefined {
  const allModels = queryClient.getQueryData<CameraModel[]>(cameraKeys.all)
  return allModels?.find((cm) => cm.id === id)
}

// Re-export AxiosError for consumers
export type { AxiosError }
