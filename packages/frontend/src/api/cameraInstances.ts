/*
 * FILE SUMMARY — src/api/cameraInstances.ts
 *
 * TanStack Query hooks for camera instance operations within a project.
 * Camera instances represent physical camera placements on the map.
 *
 * useCameraInstances(projectId)            — GET  /projects/:id/cameras
 * useSyncCameraInstancesToStore(projectId) — syncs query data into Zustand on load
 * useCreateCameraInstance(projectId)       — POST /projects/:id/cameras
 * useSaveDirtyCameras(projectId)           — PUT  /projects/:id/cameras/:camId  (per-dirty-camera save)
 * useDeleteCameraInstance(projectId)       — DELETE /projects/:id/cameras/:camId
 */
import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from './client'
import type { CameraInstance, CameraInstanceCreatePayload, CameraInstanceUpdatePayload } from './cameraInstances.types'
import { useCameraInstanceStore } from '../store/cameraInstanceStore'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const cameraInstanceKeys = {
  list: (projectId: string) => ['cameraInstances', projectId] as const,
  detail: (projectId: string, cameraId: string) => ['cameraInstances', projectId, cameraId] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useCameraInstances(projectId: string) {
  return useQuery({
    queryKey: cameraInstanceKeys.list(projectId),
    queryFn: async (): Promise<CameraInstance[]> => {
      const res = await client.get<CameraInstance[]>(`/projects/${projectId}/cameras`)
      return res.data
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Call this once at the page level (e.g. ProjectMapViewPage).
 * Whenever React Query's cached camera list updates (initial load or background
 * refetch) it pushes the full array into the Zustand camera store.
 * Per-camera components then subscribe to individual slices of that store.
 */
export function useSyncCameraInstancesToStore(projectId: string) {
  const { data } = useCameraInstances(projectId)
  const hydrateCameras = useCameraInstanceStore((s) => s.hydrateCameras)
  useEffect(() => {
    if (data) hydrateCameras(data)
  }, [data, hydrateCameras])
}

export function useCreateCameraInstance(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CameraInstanceCreatePayload): Promise<CameraInstance> => {
      const res = await client.post<CameraInstance>(`/projects/${projectId}/cameras`, data)
      return res.data
    },
    onSuccess: (newCamera) => {
      // Append to cache without a full refetch
      queryClient.setQueryData<CameraInstance[]>(
        cameraInstanceKeys.list(projectId),
        (old) => [...(old ?? []), newCamera],
      )
      // Mirror into the Zustand working-copy store
      useCameraInstanceStore.getState().addCamera(newCamera)
    },
  })
}

/**
 * Saves a single camera's edited data to the server.
 * On success it patches the React Query cache in-place and syncs the
 * server-canonical values back into the Zustand store, then clears the dirty flag.
 */
export function useSaveDirtyCameras(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cameraId,
      data,
    }: {
      cameraId: string
      data: CameraInstanceUpdatePayload
    }): Promise<CameraInstance> => {
      const res = await client.put<CameraInstance>(
        `/projects/${projectId}/cameras/${cameraId}`,
        data,
      )
      return res.data
    },
    onSuccess: (updated) => {
      // Patch the single entry in the React Query cache — no full refetch
      queryClient.setQueryData<CameraInstance[]>(
        cameraInstanceKeys.list(projectId),
        (old) => (old ?? []).map((c) => (c.id === updated.id ? updated : c)),
      )
      // Sync server-canonical values back and clear the dirty flag
      useCameraInstanceStore.getState().markCameraSynced(updated.id, updated)
    },
  })
}

export function useDeleteCameraInstance(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cameraId: string): Promise<void> => {
      await client.delete(`/projects/${projectId}/cameras/${cameraId}`)
    },
    onSuccess: (_void, cameraId) => {
      // Remove from cache without a full refetch
      queryClient.setQueryData<CameraInstance[]>(
        cameraInstanceKeys.list(projectId),
        (old) => (old ?? []).filter((c) => c.id !== cameraId),
      )
      // Remove from the Zustand working-copy store
      useCameraInstanceStore.getState().removeCamera(cameraId)
    },
  })
}
