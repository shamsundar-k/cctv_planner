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
import { useEffect, useState, useCallback } from 'react'
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
  const mergeHydrate = useCameraInstanceStore((s) => s.mergeHydrate)
  useEffect(() => {
    if (data) mergeHydrate(data)
  }, [data, mergeHydrate])
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

/**
 * POSTs all cameras currently in `createdIds` (temp-ID cameras) to the server.
 * For each success, replaces the temp ID with the server-assigned ID.
 * For each failure, marks the camera as failed so it survives mergeHydrate.
 * After all POSTs settle, fetches the full camera list and merges into the store.
 */
export function useSaveNewCameras(projectId: string) {
  const queryClient = useQueryClient()
  const [isSavingNew, setIsSavingNew] = useState(false)

  const saveNewCameras = useCallback(async () => {
    const store = useCameraInstanceStore.getState()
    const tempCameras = [...store.createdIds].map((id) => store.cameraInstances[id]).filter(Boolean)
    if (tempCameras.length === 0) return

    setIsSavingNew(true)
    try {
      const results = await Promise.allSettled(
        tempCameras.map(async (cam) => {
          const payload: CameraInstanceCreatePayload = {
            camera_model_id: cam.camera_model_id,
            label: cam.label,
            lat: cam.lat,
            lng: cam.lng,
            bearing: cam.bearing,
            height: cam.height,
            tilt_angle: cam.tilt_angle,
            focal_length_chosen: cam.focal_length_chosen,
            colour: cam.colour,
            visible: cam.visible,
            fov_visible_geojson: cam.fov_visible_geojson,
            fov_ir_geojson: cam.fov_ir_geojson,
            target_distance: cam.target_distance,
            target_height: cam.target_height,
          }
          const res = await client.post<CameraInstance>(`/projects/${projectId}/cameras`, payload)
          return { tempId: cam.id, serverCamera: res.data }
        }),
      )

      const { replaceTempId, markCameraFailed } = useCameraInstanceStore.getState()
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled') {
          const { tempId, serverCamera } = result.value
          replaceTempId(tempId, serverCamera.id, serverCamera)
          // Append to React Query cache (temp ID was never in the cache)
          queryClient.setQueryData<CameraInstance[]>(
            cameraInstanceKeys.list(projectId),
            (old) => [...(old ?? []), serverCamera],
          )
        } else {
          markCameraFailed(tempCameras[i].id)
        }
      }

      // Selective hydration: fetch server list then merge (failed cameras preserved by mergeHydrate)
      const fetchRes = await client.get<CameraInstance[]>(`/projects/${projectId}/cameras`)
      queryClient.setQueryData(cameraInstanceKeys.list(projectId), fetchRes.data)
      useCameraInstanceStore.getState().mergeHydrate(fetchRes.data)
    } finally {
      setIsSavingNew(false)
    }
  }, [projectId, queryClient])

  return { saveNewCameras, isSavingNew }
}
