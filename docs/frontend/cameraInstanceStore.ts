import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CameraInstance, CameraInstanceCreatePayload, CameraInstanceUpdatePayload } from '../api/cameraInstances.types'
import client from '../api/client'

// ── Types ──────────────────────────────────────────────────────────────────────

export type CameraSaveStatus = 'pending' | 'saving' | 'saved' | 'failed'

export interface CameraTrackingEntry {
  isNew: boolean             // true = needs POST, false = needs PUT
  isDirty: boolean           // true = needs POST or PUT on next save cycle
  status: CameraSaveStatus
  error: string | null       // populated on failure
}

export interface CameraRecord {
  camera: CameraInstance        // pure server data — what gets sent to API
  tracking: CameraTrackingEntry // client sync state — never sent to API
}

// Cameras removed from the map but not yet DELETE-d on server.
// Keyed by clientId — O(1) lookup, duplicate prevention by key uniqueness.
// Only cameras that reached status: saved are ever added here (isNew: false).
type DeletedCameraClientId = string

// ── Store interface ────────────────────────────────────────────────────────────

interface CameraInstanceStoreState {
  // Core data — keyed by clientId
  clientIds: string[]
  cameraRecords: Record<string, CameraRecord>

  // Cameras removed from map that need DELETE on server — Set of clientIds
  // Only ever contains clientIds of cameras that were saved (isNew was false)
  deletedCameras: Set<DeletedCameraClientId>

  // Global derived state
  isLoading: boolean
  loadError: string | null

  // ── Selectors (derived) ───────────────────────────────────────────────────
  // Cameras that need POST  — isNew: true + isDirty + not already saving
  getCamerasToPost: () => CameraRecord[]
  // Cameras that need PUT   — isNew: false + isDirty + not already saving
  getCamerasToPut: () => CameraRecord[]
  // True if any camera is dirty or there are pending deletes
  getIsDirty: () => boolean

  // ── Actions ───────────────────────────────────────────────────────────────

  // Load server state into store — called once on page mount
  loadCameras: (projectId: string) => Promise<void>

  // Place a new camera locally — assigns a clientId, no server call
  addCamera: (camera: CameraInstance) => string  // returns clientId

  // Patch camera data fields — called from properties panel
  updateCamera: (clientId: string, patch: Partial<CameraInstance>) => void

  // Remove camera from map:
  //   - if isNew (never saved)   → drop entirely, no server call
  //   - if not isNew (saved)     → add clientId to deletedCameras
  removeCamera: (clientId: string) => void

  // ── Save cycle actions ────────────────────────────────────────────────────

  // Mark camera as in-flight — called just before POST/PUT is sent
  // Sets isDirty: false so a second Save press skips this camera
  markSaving: (clientId: string) => void

  // Mark camera as successfully saved — clears dirty state and isNew flag
  markSaved: (clientId: string) => void

  // Mark camera as failed — restores isDirty: true so it retries on next Save
  markFailed: (clientId: string, error: string) => void

  // Remove entry from deletedCameras after successful DELETE
  markDeleted: (clientId: string) => void

  // Save all dirty cameras and pending deletes to server
  saveAll: (projectId: string) => Promise<void>
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useCameraInstanceStore = create<CameraInstanceStoreState>()(
  devtools(
    (set, get) => ({
      clientIds: [],
      cameraRecords: {},
      deletedCameras: new Set(),
      isLoading: false,
      loadError: null,

      // ── Derived selectors ───────────────────────────────────────────────────

      getCamerasToPost: () => {
        const { clientIds, cameraRecords } = get()
        return clientIds
          .map((id) => cameraRecords[id])
          .filter(
            (r) => r &&
              r.tracking.isNew &&
              r.tracking.isDirty &&
              r.tracking.status !== 'saving'
          )
      },

      getCamerasToPut: () => {
        const { clientIds, cameraRecords } = get()
        return clientIds
          .map((id) => cameraRecords[id])
          .filter(
            (r) => r &&
              !r.tracking.isNew &&
              r.tracking.isDirty &&
              r.tracking.status !== 'saving'
          )
      },

      getIsDirty: () => {
        const { clientIds, cameraRecords, deletedCameras } = get()
        const anyDirty = clientIds.some((id) => cameraRecords[id]?.tracking.isDirty)
        return anyDirty || deletedCameras.size > 0
      },

      // ── loadCameras ─────────────────────────────────────────────────────────

      loadCameras: async (projectId) => {
        set({ isLoading: true, loadError: null })
        try {
          const res = await client.get<CameraInstance[]>(`/projects/${projectId}/cameras`)
          const cameras = res.data

          // Build records — all loaded cameras are clean (saved, not dirty)
          // clientId is persisted on server — use it directly as store key
          const cameraRecords: Record<string, CameraRecord> = {}
          const clientIds: string[] = []

          for (const camera of cameras) {
            clientIds.push(camera.clientId)
            cameraRecords[camera.clientId] = {
              camera,
              tracking: {
                isNew: false,    // loaded from server — exists on server already
                isDirty: false,
                status: 'saved',
                error: null,
              },
            }
          }

          set({
            clientIds,
            cameraRecords,
            deletedCameras: new Set(),
            isLoading: false,
          })
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Failed to load cameras'
          set({ loadError: msg, isLoading: false })
        }
      },

      // ── addCamera ───────────────────────────────────────────────────────────
      // clientId must be set on camera before calling — generated by caller (uuidv4)
      // Store uses camera.clientId as the stable key throughout the session

      addCamera: (camera) => {
        const { clientId } = camera
        if (!clientId) {
          console.error('addCamera: camera.clientId is required')
          return ''
        }
        set((s) => ({
          clientIds: [...s.clientIds, clientId],
          cameraRecords: {
            ...s.cameraRecords,
            [clientId]: {
              camera,
              tracking: {
                isNew: true,    // never saved — POST needed
                isDirty: true,
                status: 'pending',
                error: null,
              },
            },
          },
        }))
        return clientId
      },

      // ── updateCamera ────────────────────────────────────────────────────────

      updateCamera: (clientId, patch) => {
        set((s) => {
          const record = s.cameraRecords[clientId]
          // Guard: no-op if clientId unknown
          if (!record) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`updateCamera: unknown clientId "${clientId}"`)
            }
            return s
          }
          // If currently saving, buffer the edit by keeping isDirty true
          // so it gets included in the next save cycle
          const wasSaving = record.tracking.status === 'saving'
          return {
            cameraRecords: {
              ...s.cameraRecords,
              [clientId]: {
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

      removeCamera: (clientId) => {
        set((s) => {
          const record = s.cameraRecords[clientId]
          if (!record) return s

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [clientId]: _removed, ...remainingRecords } = s.cameraRecords
          const remainingIds = s.clientIds.filter((id) => id !== clientId)

          // Never saved — drop entirely, no server call needed
          if (record.tracking.isNew) {
            return {
              clientIds: remainingIds,
              cameraRecords: remainingRecords,
            }
          }

          // Saved on server — queue clientId for DELETE
          const deletedCameras = new Set(s.deletedCameras)
          deletedCameras.add(clientId)
          return {
            clientIds: remainingIds,
            cameraRecords: remainingRecords,
            deletedCameras,
          }
        })
      },

      // ── markSaving ──────────────────────────────────────────────────────────

      markSaving: (clientId) => {
        set((s) => {
          const record = s.cameraRecords[clientId]
          if (!record) return s
          return {
            cameraRecords: {
              ...s.cameraRecords,
              [clientId]: {
                ...record,
                tracking: {
                  ...record.tracking,
                  isDirty: false,   // exclude from next Save press
                  status: 'saving',
                  error: null,
                },
              },
            },
          }
        })
      },

      // ── markSaved ───────────────────────────────────────────────────────────

      markSaved: (clientId) => {
        set((s) => {
          const record = s.cameraRecords[clientId]
          if (!record) return s
          return {
            cameraRecords: {
              ...s.cameraRecords,
              [clientId]: {
                ...record,
                tracking: {
                  isNew: false,     // camera now exists on server
                  isDirty: false,
                  status: 'saved',
                  error: null,
                },
              },
            },
          }
        })
      },

      // ── markFailed ──────────────────────────────────────────────────────────

      markFailed: (clientId, error) => {
        set((s) => {
          const record = s.cameraRecords[clientId]
          if (!record) return s
          return {
            cameraRecords: {
              ...s.cameraRecords,
              [clientId]: {
                ...record,
                tracking: {
                  ...record.tracking,
                  isDirty: true,    // re-include in next Save press
                  status: 'failed',
                  error,
                },
              },
            },
          }
        })
      },

      // ── markDeleted ─────────────────────────────────────────────────────────

      markDeleted: (clientId) => {
        set((s) => {
          const deletedCameras = new Set(s.deletedCameras)
          deletedCameras.delete(clientId)
          return { deletedCameras }
        })
      },

      // ── saveAll ─────────────────────────────────────────────────────────────

      saveAll: async (projectId) => {
        const store = get()
        const toPost = store.getCamerasToPost()
        const toPut = store.getCamerasToPut()
        const toDelete = [...store.deletedCameras]  // Set → array of clientIds

        // Mark all in-flight cameras as saving before firing requests
        // This prevents a second Save press from re-sending them
        for (const record of [...toPost, ...toPut]) {
          store.markSaving(record.camera.clientId)
        }

        // Fire all three operation types in parallel
        await Promise.allSettled([

          // POST — new cameras (isNew: true)
          ...toPost.map(async (record) => {
            const { clientId } = record.camera
            try {
              const payload: CameraInstanceCreatePayload = buildCreatePayload(record.camera)
              await client.post<CameraInstance>(
                `/projects/${projectId}/cameras`,
                payload
              )
              get().markSaved(clientId)
            } catch (e) {
              get().markFailed(clientId, errorMessage(e))
            }
          }),

          // PUT — updated cameras (isNew: false) — routed by clientId on server
          ...toPut.map(async (record) => {
            const { clientId } = record.camera
            try {
              const payload: CameraInstanceUpdatePayload = buildUpdatePayload(record.camera)
              await client.put(
                `/projects/${projectId}/cameras/${clientId}`,
                payload
              )
              get().markSaved(clientId)
            } catch (e) {
              get().markFailed(clientId, errorMessage(e))
            }
          }),

          // DELETE — removed cameras — routed by clientId on server
          ...toDelete.map(async (clientId) => {
            try {
              await client.delete(`/projects/${projectId}/cameras/${clientId}`)
              get().markDeleted(clientId)
            } catch (e) {
              // markDeleted not called — clientId stays in deletedCameras for retry
              console.error(`DELETE failed for camera ${clientId}:`, e)
            }
          }),
        ])
      },
    }),
    { name: 'CameraInstanceStore' },
  ),
)

// ── Payload builders — strips client-only fields before sending ───────────────

function buildCreatePayload(camera: CameraInstance): CameraInstanceCreatePayload {
  return {
    camera_model_id: camera.camera_model_id,
    label: camera.label,
    lat: camera.lat,
    lng: camera.lng,
    bearing: camera.bearing,
    camera_height: camera.camera_height,
    tilt_angle: camera.tilt_angle,
    focal_length_chosen: camera.focal_length_chosen,
    colour: camera.colour,
    visible: camera.visible,
    fov_visible_geojson: camera.fov_visible_geojson,
    fov_ir_geojson: camera.fov_ir_geojson,
    target_distance: camera.target_distance,
    target_height: camera.target_height,
  }
}

function buildUpdatePayload(camera: CameraInstance): CameraInstanceUpdatePayload {
  return buildCreatePayload(camera)
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Unknown error'
}
