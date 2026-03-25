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
  createdIds: Set<string>   // New cameras (POST)
  updatedIds: Set<string>   // Modified cameras (PATCH)
  deletedIds: Set<string>   // Removed cameras (DELETE)

  // Actions
  addCamera: (camera: CameraInstance) => void
  updateCamera: (id: string, patch: Partial<CameraInstance>) => void
  removeCamera: (id: string) => void

  // Sync helpers
  hydrateCameras: (cameras: CameraInstance[]) => void
  // Write server-canonical data back and remove this camera from all dirty sets
  markCameraSynced: (id: string, canonical: CameraInstance) => void
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
        }),

      markSaved: () =>
        set({
          isDirty: false,
          lastSavedAt: new Date(),
          createdIds: new Set(),
          updatedIds: new Set(),
          deletedIds: new Set(),
        }),

      clearChanges: () =>
        set({
          isDirty: false,
          createdIds: new Set(),
          updatedIds: new Set(),
          deletedIds: new Set(),
        }),
    }),
    { name: 'CameraStore' },
  ),
)
