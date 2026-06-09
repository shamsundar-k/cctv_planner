import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '../types/projects.types'
import {
  createProject,
  deleteProject,
  fetchProject,
  fetchProjects,
  updateProject,
} from '../service/api/projects'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectDTO): Promise<Project> => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string
      updates: UpdateProjectDTO
    }): Promise<Project> => updateProject(projectId, updates),
    onSuccess: (project, { projectId }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), project)
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string): Promise<void> => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

// Re-export AxiosError for consumers
export type { AxiosError }
