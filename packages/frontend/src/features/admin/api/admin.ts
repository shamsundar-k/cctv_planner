import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import client from '../../../api/client'
import type {
  AdminPasswordResetRequest,
  AdminProjectStats,
  AdminUser,
} from './admin.types'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const adminKeys = {
  users: ['admin', 'users'] as const,
  projectStats: ['admin', 'projects', 'stats'] as const,
  passwordResetRequests: ['admin', 'password-reset-requests'] as const,
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

export function useProjectStats() {
  return useQuery({
    queryKey: adminKeys.projectStats,
    queryFn: async (): Promise<AdminProjectStats> => {
      const res = await client.get<AdminProjectStats>('/admin/projects/stats')
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

export function usePasswordResetRequests() {
  return useQuery({
    queryKey: adminKeys.passwordResetRequests,
    queryFn: async (): Promise<AdminPasswordResetRequest[]> => {
      const res = await client.get<AdminPasswordResetRequest[]>(
        '/admin/password-reset-requests',
      )
      return res.data
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useResetRequestedPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string): Promise<void> => {
      await client.post(`/admin/password-reset-requests/${requestId}/reset`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.passwordResetRequests })
      queryClient.invalidateQueries({ queryKey: adminKeys.users })
    },
    retry: 0,
  })
}

export function useRejectPasswordResetRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string): Promise<void> => {
      await client.post(`/admin/password-reset-requests/${requestId}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.passwordResetRequests })
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
