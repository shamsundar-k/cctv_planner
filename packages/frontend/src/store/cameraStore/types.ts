import type { Camera } from '../../types/camera.types'

// ── Tracking ───────────────────────────────────────────────────────────────────

export type CameraSaveStatus = 'pending' | 'saving' | 'saved' | 'failed'

export interface CameraTrackingEntry {
  isNew: boolean             // true = needs POST, false = needs PUT
  isDirty: boolean           // true = needs POST or PUT on next save cycle
  status: CameraSaveStatus
  error: string | null       // populated on failure
}

export interface CameraRecord {
  camera: Camera        // pure server data — what gets sent to API
  tracking: CameraTrackingEntry // client sync state — never sent to API
}

// ── Store interface ────────────────────────────────────────────────────────────

export interface CameraStoreState {
  // Ordered list of camera UIDs — drives render order
  uids: string[]
  cameraRecords: Record<string, CameraRecord>

  // UIDs removed from map that need DELETE on server
  // Only ever contains UIDs of cameras that were saved (isNew was false)
  deletedCameras: Set<string>

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

  // Place a new camera locally — no server call; returns uid
  addCamera: (camera: Camera) => string

  // Patch camera data fields — called from properties panel
  updateCamera: (uid: string, patch: Partial<Camera>) => void

  // Remove camera from map:
  //   - if isNew (never saved)   → drop entirely, no server call
  //   - if not isNew (saved)     → add uid to deletedCameras
  removeCamera: (uid: string) => void

  // ── Save cycle actions ────────────────────────────────────────────────────

  // Mark camera as in-flight — called just before POST/PUT is sent
  // Sets isDirty: false so a second Save press skips this camera
  markSaving: (uid: string) => void

  // Mark camera as successfully saved — clears dirty state and isNew flag
  markSaved: (uid: string) => void

  // Mark camera as failed — restores isDirty: true so it retries on next Save
  markFailed: (uid: string, error: string) => void

  // Remove entry from deletedCameras after successful DELETE
  markDeleted: (uid: string) => void

  // Save all dirty cameras and pending deletes to server
  saveAll: (projectId: string) => Promise<void>
}
