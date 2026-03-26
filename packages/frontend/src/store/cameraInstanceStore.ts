import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CameraInstance } from '../api/cameraInstances.types'

interface CameraStoreState {
  // Data
  cameraIds: string[]
  cameraInstances: Record<string, CameraInstance>

  // Change tracking
  isDirty: boolean
  lastSavedAt: Date | null

  // Track what changed and how
  createdIds: Set<string>      // New cameras (POST)
  updatedIds: Set<string>      // Modified cameras (PATCH)
  deletedIds: Set<string>      // Removed cameras (DELETE)
  failedCameraIds: Set<string> // Temp IDs that failed POST

  // Actions
  addCamera: (camera: CameraInstance) => void
  updateCamera: (id: string, patch: Partial<CameraInstance>) => void
  removeCamera: (id: string) => void

  // Sync helpers
  hydrateCameras: (cameras: CameraInstance[]) => void
  // Merge server-fetched cameras with locally-failed cameras (preserves failedCameraIds)
  mergeHydrate: (fetchedCameras: CameraInstance[]) => void
  // Write server-canonical data back and remove this camera from all dirty sets
  markCameraSynced: (id: string, canonical: CameraInstance) => void
  // Replace a temp ID with the server-assigned ID after a successful POST
  replaceTempId: (tempId: string, serverId: string, serverCamera: CameraInstance) => void
  // Mark a temp-ID camera as failed so it persists through mergeHydrate
  markCameraFailed: (tempId: string) => void
  markSaved: () => void
  clearChanges: () => void
}

export const useCameraInstanceStore = create<CameraStoreState>()(
  devtools(
    (set) => ({
      // Initial state
      cameraIds: [],
      cameraInstances: {},
      isDirty: false,
      lastSavedAt: null,
      createdIds: new Set(),
      updatedIds: new Set(),
      deletedIds: new Set(),
      failedCameraIds: new Set(),

      addCamera: (camera) =>
        set((s) => {
          const created = new Set(s.createdIds)
          created.add(camera.id)
          return {
            cameraIds: [...s.cameraIds, camera.id],
            cameraInstances: { ...s.cameraInstances, [camera.id]: camera },
            createdIds: created,
            isDirty: true,
          }
        }),

      updateCamera: (id, patch) =>
        set((s) => {
          if (!s.cameraInstances[id] || Object.keys(patch).length === 0) return s
          const updated = new Set(s.updatedIds)
          const created = new Set(s.createdIds)
          // If camera was just created, keep it in createdIds (don't move to updatedIds)
          if (!created.has(id)) {
            updated.add(id)
          }
          return {
            cameraInstances: {
              ...s.cameraInstances,
              [id]: { ...s.cameraInstances[id], ...patch },
            },
            updatedIds: updated,
            isDirty: true,
          }
        }),

      removeCamera: (id) =>
        set((s) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _removed, ...rest } = s.cameraInstances
          const created = new Set(s.createdIds)
          const updated = new Set(s.updatedIds)
          const deleted = new Set(s.deletedIds)
          // If camera was created but not yet saved, just drop it
          if (created.has(id)) {
            created.delete(id)
          } else {
            // Camera exists on server — mark for deletion
            deleted.add(id)
          }
          updated.delete(id)
          return {
            cameraIds: s.cameraIds.filter((i) => i !== id),
            cameraInstances: rest,
            createdIds: created,
            updatedIds: updated,
            deletedIds: deleted,
            isDirty: true,
          }
        }),

      markCameraSynced: (id, canonical) =>
        set((s) => {
          if (!s.cameraInstances[id]) return s
          const created = new Set(s.createdIds)
          const updated = new Set(s.updatedIds)
          created.delete(id)
          updated.delete(id)
          const stillDirty = created.size > 0 || updated.size > 0 || s.deletedIds.size > 0
          return {
            cameraInstances: { ...s.cameraInstances, [id]: canonical },
            createdIds: created,
            updatedIds: updated,
            isDirty: stillDirty,
          }
        }),

      // Load server state without marking anything dirty
      hydrateCameras: (cameras) =>
        set({
          cameraIds: cameras.map((c) => c.id),
          cameraInstances: Object.fromEntries(cameras.map((c) => [c.id, c])),
          isDirty: false,
          createdIds: new Set(),
          updatedIds: new Set(),
          deletedIds: new Set(),
          failedCameraIds: new Set(),
        }),

      // Merge server-fetched cameras with locally-failed cameras.
      // Failed cameras (temp IDs) are kept in place so the user can retry saving them.
      mergeHydrate: (fetchedCameras) =>
        set((s) => {
          const failedIds = s.failedCameraIds
          const failedCameras = [...failedIds].map((id) => s.cameraInstances[id]).filter(Boolean)
          const fetchedMap = Object.fromEntries(fetchedCameras.map((c) => [c.id, c]))
          const failedMap = Object.fromEntries(failedCameras.map((c) => [c.id, c]))
          return {
            cameraIds: [...fetchedCameras.map((c) => c.id), ...failedIds],
            cameraInstances: { ...fetchedMap, ...failedMap },
            createdIds: new Set(failedIds), // failed cameras still need a POST retry
            updatedIds: new Set(),
            deletedIds: new Set(),
            isDirty: failedIds.size > 0,
            // failedCameraIds unchanged — persists until retry succeeds
          }
        }),

      replaceTempId: (tempId, serverId, serverCamera) =>
        set((s) => {
          if (!s.cameraInstances[tempId]) return s
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [tempId]: _removed, ...restInstances } = s.cameraInstances
          const created = new Set(s.createdIds)
          created.delete(tempId)
          const stillDirty = created.size > 0 || s.updatedIds.size > 0 || s.deletedIds.size > 0
          return {
            cameraIds: s.cameraIds.map((id) => (id === tempId ? serverId : id)),
            cameraInstances: { ...restInstances, [serverId]: serverCamera },
            createdIds: created,
            isDirty: stillDirty,
          }
        }),

      markCameraFailed: (tempId) =>
        set((s) => {
          const created = new Set(s.createdIds)
          created.delete(tempId)
          const failed = new Set(s.failedCameraIds)
          failed.add(tempId)
          return {
            createdIds: created,
            failedCameraIds: failed,
            isDirty: true, // failed cameras still need attention
          }
        }),

      markSaved: () =>
        set({
          isDirty: false,
          lastSavedAt: new Date(),
          createdIds: new Set(),
          updatedIds: new Set(),
          deletedIds: new Set(),
          failedCameraIds: new Set(),
        }),

      clearChanges: () =>
        set({
          isDirty: false,
          createdIds: new Set(),
          updatedIds: new Set(),
          deletedIds: new Set(),
          failedCameraIds: new Set(),
        }),
    }),
    { name: 'CameraStore' },
  ),
)
