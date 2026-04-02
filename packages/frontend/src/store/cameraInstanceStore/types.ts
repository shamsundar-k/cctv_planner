import type { CameraInstance } from '../../api/cameraInstances.types'

// ── Tracking ───────────────────────────────────────────────────────────────────

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
export type DeletedCameraClientId = string

// ── Store interface ────────────────────────────────────────────────────────────

export interface CameraInstanceStoreState {
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
