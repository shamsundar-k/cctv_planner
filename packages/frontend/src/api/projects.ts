import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'

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
  created_at: string
  updated_at: string
}

export interface CreateProjectDTO {
  name: string
  description?: string
}

export interface UpdateProjectDTO {
  name?: string
  description?: string
}

// ── Query keys ─────────────────────────────────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

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
