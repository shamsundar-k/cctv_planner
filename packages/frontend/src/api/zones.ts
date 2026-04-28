import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'
import type { Zone, ZoneCreatePayload } from '../types/zone.types'

export const zoneKeys = {
  all: (projectId: string) => ['zones', projectId] as const,
}

export function useZones(projectId: string) {
  return useQuery({
    queryKey: zoneKeys.all(projectId),
    queryFn: async (): Promise<Zone[]> => {
      const res = await client.get<Zone[]>(`/projects/${projectId}/zones`)
      return res.data
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

export function useCreateZone(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ZoneCreatePayload): Promise<Zone> => {
      const res = await client.post<Zone>(`/projects/${projectId}/zones`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: zoneKeys.all(projectId) })
    },
  })
}

export function useDeleteZone(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (zoneId: string): Promise<void> => {
      await client.delete(`/projects/${projectId}/zones/${zoneId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: zoneKeys.all(projectId) })
    },
  })
}
