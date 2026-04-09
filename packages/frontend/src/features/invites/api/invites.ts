import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '../../../api/client'
import type { AdminInvite, InviteResponse } from './invites.types'

export const inviteKeys = {
  all: ['admin', 'invites'] as const,
}

export function useAllInvites() {
  return useQuery({
    queryKey: inviteKeys.all,
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
      queryClient.invalidateQueries({ queryKey: inviteKeys.all })
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
      await queryClient.cancelQueries({ queryKey: inviteKeys.all })
      const snapshot = queryClient.getQueryData<AdminInvite[]>(inviteKeys.all)
      queryClient.setQueryData<AdminInvite[]>(inviteKeys.all, (prev) =>
        prev ? prev.filter((i) => i.id !== inviteId) : [],
      )
      return { snapshot }
    },
    onError: (_err, _inviteId, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(inviteKeys.all, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.all })
    },
    retry: 0,
  })
}
