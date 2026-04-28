import type { CameraRecord, CameraTrackingEntry } from './types'

/**
 * Returns an updated cameraRecords map with the given tracking patch applied,
 * or null if uid is not found (caller should no-op).
 */
export function withTrackingPatch(
  records: Record<string, CameraRecord>,
  uid: string,
  patch: Partial<CameraTrackingEntry>,
): Record<string, CameraRecord> | null {
  const record = records[uid]
  if (!record) return null
  return {
    ...records,
    [uid]: {
      ...record,
      tracking: { ...record.tracking, ...patch },
    },
  }
}

/** Returns all dirty, non-saving camera records matching the given isNew flag. */
export function filterCameras(
  uids: string[],
  cameraRecords: Record<string, CameraRecord>,
  isNew: boolean,
): CameraRecord[] {
  return uids
    .map((id) => cameraRecords[id])
    .filter((r): r is CameraRecord =>
      r != null &&
      r.tracking.isNew === isNew &&
      r.tracking.isDirty &&
      r.tracking.status !== 'saving'
    )
}
