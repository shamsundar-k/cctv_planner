/*
 * FILE SUMMARY — src/api/admin.ts
 *
 * TanStack Query hooks and utilities for admin-only API endpoints. All hooks
 * use the shared Axios client and the `adminKeys` cache-key namespace.
 *
 * useAllUsers() — Query hook; fetches the full list of registered users from
 *   GET /admin/users. Stale after 2 min, evicted after 10 min.
 *
 * useAllProjects() — Query hook; fetches all projects from GET /projects for
 *   the admin overview. Stale after 2 min, evicted after 10 min.
 *
 * useAllInvites() — Query hook; fetches active invite records from
 *   GET /admin/invites. Stale after 1 min, evicted after 5 min.
 *
 * useGenerateInvite() — Mutation hook; POSTs { email } to /admin/invite to
 *   create a new invite link. Returns the InviteResponse (id, invite_url,
 *   expires_at). On success, invalidates the invites query.
 *
 * useDeleteUser() — Mutation hook; sends DELETE /admin/users/:id. Uses
 *   optimistic update: removes the user from cache immediately, rolls back on
 *   error, then invalidates the users query on settle.
 *
 * useDeleteProject() — Mutation hook; sends DELETE /projects/:id. Uses
 *   optimistic update against the admin projects cache, rolls back on error.
 *
 * useRevokeInvite() — Mutation hook; sends DELETE /admin/invites/:id. Uses
 *   optimistic update: removes the invite from cache immediately, rolls back on
 *   error, then invalidates invites on settle.
 *
 * useDebounce<T>(value, delay) — Internal hook; delays propagation of a value
 *   by `delay` ms (default 300 ms) to debounce user input.
 *
 * useSearchUsers(query) — Composite hook; wraps useAllUsers() and filters
 *   results client-side by email or full_name using a debounced query string.
 *
 * useSearchProjects(query) — Composite hook; wraps useAllProjects() and
 *   filters results client-side by project name using a debounced query string.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import client from './client'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  full_name: string
  system_role: 'admin' | 'user'
  created_at: string
}

export interface AdminProject {
  id: string
  name: string
  owner_id: string
  camera_count: number
  created_at: string
}

export interface InviteResponse {
  id: string
  invite_url: string
  expires_at: string
}

export interface AdminInvite {
  id: string
  email: string
  invited_by_email: string
  created_at: string
  expires_at: string
}

// ── Query keys ─────────────────────────────────────────────────────────────────

export const adminKeys = {
  users: ['admin', 'users'] as const,
  projects: ['admin', 'projects'] as const,
  invites: ['admin', 'invites'] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useAllUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async (): Promise<AdminUser[]> => {
      const res = await client.get<AdminUser[]>('/admin/users')
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

export function useAllProjects() {
  return useQuery({
    queryKey: adminKeys.projects,
    queryFn: async (): Promise<AdminProject[]> => {
      const res = await client.get<AdminProject[]>('/projects')
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

export function useAllInvites() {
  return useQuery({
    queryKey: adminKeys.invites,
    queryFn: async (): Promise<AdminInvite[]> => {
      const res = await client.get<AdminInvite[]>('/admin/invites')
      return res.data
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useGenerateInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (email: string): Promise<InviteResponse> => {
      const res = await client.post<InviteResponse>('/admin/invite', { email })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.invites })
    },
    retry: 0,
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await client.delete(`/admin/users/${userId}`)
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.users })
      const snapshot = queryClient.getQueryData<AdminUser[]>(adminKeys.users)
      queryClient.setQueryData<AdminUser[]>(adminKeys.users, (prev) =>
        prev ? prev.filter((u) => u.id !== userId) : [],
      )
      return { snapshot }
    },
    onError: (_err, _userId, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(adminKeys.users, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users })
    },
    retry: 0,
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      await client.delete(`/projects/${projectId}`)
    },
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.projects })
      const snapshot = queryClient.getQueryData<AdminProject[]>(adminKeys.projects)
      queryClient.setQueryData<AdminProject[]>(adminKeys.projects, (prev) =>
        prev ? prev.filter((p) => p.id !== projectId) : [],
      )
      return { snapshot }
    },
    onError: (_err, _projectId, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(adminKeys.projects, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.projects })
    },
    retry: 0,
  })
}

export function useRevokeInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inviteId: string): Promise<void> => {
      await client.delete(`/admin/invites/${inviteId}`)
    },
    onMutate: async (inviteId) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.invites })
      const snapshot = queryClient.getQueryData<AdminInvite[]>(adminKeys.invites)
      queryClient.setQueryData<AdminInvite[]>(adminKeys.invites, (prev) =>
        prev ? prev.filter((i) => i.id !== inviteId) : [],
      )
      return { snapshot }
    },
    onError: (_err, _inviteId, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(adminKeys.invites, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.invites })
    },
    retry: 0,
  })
}

// ── Debounced search hooks ─────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useSearchUsers(query: string) {
  const debouncedQuery = useDebounce(query)
  const { data: users = [], ...rest } = useAllUsers()

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q),
    )
  }, [users, debouncedQuery])

  return { data: results, ...rest }
}

export function useSearchProjects(query: string) {
  const debouncedQuery = useDebounce(query)
  const { data: projects = [], ...rest } = useAllProjects()

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, debouncedQuery])

  return { data: results, ...rest }
}
