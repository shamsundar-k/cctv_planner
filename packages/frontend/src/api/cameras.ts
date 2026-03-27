/*
 * FILE SUMMARY — src/api/cameras.ts
 *
 * TanStack Query hooks for the global camera-model catalogue.
 *
 * useAllCameras() — Fetches the full catalogue of camera models.
 * useCamera() — Fetches a single camera model by ID.
 * useCreateCamera() — Creates a new camera model.
 * useUpdateCamera() — Updates an existing camera model.
 * useDeleteCamera() — Deletes a camera model with optimistic updates.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'
import type { CameraModel, CameraModelCreate, CameraModelUpdate } from './cameras.types'

import { queryClient } from '../queryClient'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const cameraKeys = {
  all: ['cameras'] as const,
  detail: (id: string) => ['cameras', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useAllCameras() {
  return useQuery({
    queryKey: cameraKeys.all,
    queryFn: async (): Promise<CameraModel[]> => {
      const res = await client.get<CameraModel[]>('/camera-models')
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCamera(id: string) {
  return useQuery({
    queryKey: cameraKeys.detail(id),
    queryFn: async (): Promise<CameraModel> => {
      const res = await client.get<CameraModel>(`/camera-models/${id}`)
      return res.data
    },
    enabled: !!id && id !== 'new',
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCamera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CameraModelCreate): Promise<CameraModel> => {
      const res = await client.post<CameraModel>('/camera-models', body)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
    },
    retry: 0,
  })
}

export function useUpdateCamera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: CameraModelUpdate }): Promise<CameraModel> => {
      const res = await client.put<CameraModel>(`/camera-models/${id}`, body)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
      queryClient.setQueryData(cameraKeys.detail(data.id), data)
    },
    retry: 0,
  })
}

export function useDeleteCamera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await client.delete(`/camera-models/${id}`)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cameraKeys.all })
      const snapshot = queryClient.getQueryData<CameraModel[]>(cameraKeys.all)
      queryClient.setQueryData<CameraModel[]>(cameraKeys.all, (prev) =>
        prev ? prev.filter((c) => c.id !== id) : [],
      )
      return { snapshot }
    },
    onError: (_err, _id, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(cameraKeys.all, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
    },
    retry: 0,
  })
}
//camera details fetch Non-hook

export async function getCameraModelDetails(id: string): Promise<CameraModel> {
  return queryClient.fetchQuery({
    queryKey: cameraKeys.detail(id),
    queryFn: async () => {
      const res = await client.get<CameraModel>(`/camera-models/${id}`)
      return res.data
    },
    staleTime: 2 * 60 * 1000,
  })
}


