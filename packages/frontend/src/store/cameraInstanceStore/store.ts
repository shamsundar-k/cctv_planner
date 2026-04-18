import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CameraInstance, CameraInstanceCreatePayload, CameraInstanceUpdatePayload } from '../../api/cameraInstances.types'
import client from '../../api/client'
import type { CameraInstanceStoreState, CameraRecord } from './types'
import { filterCameras, withTrackingPatch } from './helpers'
import { buildCreatePayload, buildUpdatePayload, errorMessage } from './payloadBuilders'

export const useCameraInstanceStore = create<CameraInstanceStoreState>()(
  devtools(
    (set, get) => ({
      uids: [],
      cameraRecords: {},
      deletedCameras: new Set(),
      isLoading: false,
      loadError: null,

      // ── Derived selectors ───────────────────────────────────────────────────

      getCamerasToPost: () => {
        const { uids, cameraRecords } = get()
        return filterCameras(uids, cameraRecords, true)
      },

      getCamerasToPut: () => {
        const { uids, cameraRecords } = get()
        return filterCameras(uids, cameraRecords, false)
      },

      getIsDirty: () => {
        const { uids, cameraRecords, deletedCameras } = get()
        return deletedCameras.size > 0 || uids.some((id) => cameraRecords[id]?.tracking.isDirty)
      },

      // ── loadCameras ─────────────────────────────────────────────────────────

      loadCameras: async (projectId) => {
        set({ isLoading: true, loadError: null })
        try {
          console.log("Fetching project cameras")
          const res = await client.get<CameraInstance[]>(`/projects/${projectId}/cameras`)
          console.log("Project cameras fetched", res.data)

          const cameraRecords: Record<string, CameraRecord> = {}
          const uids: string[] = []

          for (const camera of res.data) {
            uids.push(camera.uid)
            cameraRecords[camera.uid] = {
              camera,
              tracking: { isNew: false, isDirty: false, status: 'saved', error: null },
            }
          }

          set({ uids, cameraRecords, deletedCameras: new Set(), isLoading: false })
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Failed to load cameras'
          set({ loadError: msg, isLoading: false })
        }
      },

      // ── addCamera ───────────────────────────────────────────────────────────

      addCamera: (camera) => {
        const uid = camera.uid
        if (!uid) {
          console.error('addCamera: camera.uid is required')
          return ''
        }
        set((s) => ({
          uids: [...s.uids, uid],
          cameraRecords: {
            ...s.cameraRecords,
            [uid]: {
              camera,
              tracking: { isNew: true, isDirty: true, status: 'pending', error: null },
            },
          },
        }))
        return uid
      },

      // ── updateCamera ────────────────────────────────────────────────────────

      updateCamera: (uid, patch) => {
        set((s) => {
          const record = s.cameraRecords[uid]
          if (!record) {
            console.warn(`updateCamera: unknown uid "${uid}"`)
            return s
          }
          const wasSaving = record.tracking.status === 'saving'
          return {
            cameraRecords: {
              ...s.cameraRecords,
              [uid]: {
                camera: { ...record.camera, ...patch },
                tracking: {
                  ...record.tracking,
                  isDirty: true,
                  // Don't revert status back to pending if saving — let
                  // markSaved/markFailed handle that transition
                  status: wasSaving ? 'saving' : 'pending',
                },
              },
            },
          }
        })
      },

      // ── removeCamera ────────────────────────────────────────────────────────

      removeCamera: (uid) => {
        set((s) => {
          const record = s.cameraRecords[uid]
          if (!record) return s

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [uid]: _removed, ...remainingRecords } = s.cameraRecords
          const remainingUids = s.uids.filter((id) => id !== uid)

          if (record.tracking.isNew) {
            // Never saved — drop entirely, no server call needed
            return { uids: remainingUids, cameraRecords: remainingRecords }
          }

          // Saved on server — queue uid for DELETE
          const deletedCameras = new Set(s.deletedCameras)
          deletedCameras.add(uid)
          return { uids: remainingUids, cameraRecords: remainingRecords, deletedCameras }
        })
      },

      // ── markSaving ──────────────────────────────────────────────────────────

      markSaving: (uid) => {
        set((s) => {
          const updated = withTrackingPatch(s.cameraRecords, uid, {
            isDirty: false,   // exclude from next Save press
            status: 'saving',
            error: null,
          })
          return updated ? { cameraRecords: updated } : s
        })
      },

      // ── markSaved ───────────────────────────────────────────────────────────

      markSaved: (uid) => {
        set((s) => {
          const updated = withTrackingPatch(s.cameraRecords, uid, {
            isNew: false,     // camera now exists on server
            isDirty: false,
            status: 'saved',
            error: null,
          })
          return updated ? { cameraRecords: updated } : s
        })
      },

      // ── markFailed ──────────────────────────────────────────────────────────

      markFailed: (uid, error) => {
        set((s) => {
          const updated = withTrackingPatch(s.cameraRecords, uid, {
            isDirty: true,    // re-include in next Save press
            status: 'failed',
            error,
          })
          return updated ? { cameraRecords: updated } : s
        })
      },

      // ── markDeleted ─────────────────────────────────────────────────────────

      markDeleted: (uid) => {
        set((s) => {
          const deletedCameras = new Set(s.deletedCameras)
          deletedCameras.delete(uid)
          return { deletedCameras }
        })
      },

      // ── saveAll ─────────────────────────────────────────────────────────────

      saveAll: async (projectId) => {
        const store = get()
        const toPost = store.getCamerasToPost()
        const toPut = store.getCamerasToPut()
        const toDelete = [...store.deletedCameras]

        // Mark all in-flight cameras as saving before firing requests
        // This prevents a second Save press from re-sending them
        for (const record of [...toPost, ...toPut]) {
          store.markSaving(record.camera.uid)
        }

        // Fire all three operation types in parallel
        await Promise.allSettled([

          // POST — new cameras (isNew: true)
          ...toPost.map(async (record) => {
            const uid = record.camera.uid
            try {
              const payload: CameraInstanceCreatePayload = buildCreatePayload(record.camera)
              await client.post<CameraInstance>(`/projects/${projectId}/cameras`, payload)
              get().markSaved(uid)
            } catch (e) {
              get().markFailed(uid, errorMessage(e))
            }
          }),

          // PUT — updated cameras (isNew: false)
          ...toPut.map(async (record) => {
            const uid = record.camera.uid
            try {
              const payload: CameraInstanceUpdatePayload = buildUpdatePayload(record.camera)
              await client.put(`/projects/${projectId}/cameras/${uid}`, payload)
              get().markSaved(uid)
            } catch (e) {
              get().markFailed(uid, errorMessage(e))
            }
          }),

          // DELETE — removed cameras
          ...toDelete.map(async (uid) => {
            try {
              await client.delete(`/projects/${projectId}/cameras/${uid}`)
              get().markDeleted(uid)
            } catch (e) {
              // markDeleted not called — uid stays in deletedCameras for retry
              console.error(`DELETE failed for camera ${uid}:`, e)
            }
          }),
        ])
      },
    }),
    { name: 'CameraInstanceStore' },
  ),
)
