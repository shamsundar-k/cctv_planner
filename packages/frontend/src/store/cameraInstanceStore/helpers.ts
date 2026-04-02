import type { CameraRecord, CameraTrackingEntry } from './types'

/**
 * Returns an updated cameraRecords map with the given tracking patch applied,
 * or null if clientId is not found (caller should no-op).
 */
export function withTrackingPatch(
  records: Record<string, CameraRecord>,
  clientId: string,
  patch: Partial<CameraTrackingEntry>,
): Record<string, CameraRecord> | null {
  const record = records[clientId]
  if (!record) return null
  return {
    ...records,
    [clientId]: {
      ...record,
      tracking: { ...record.tracking, ...patch },
    },
  }
}

/** Returns all dirty, non-saving camera records matching the given isNew flag. */
export function filterCameras(
  clientIds: string[],
  cameraRecords: Record<string, CameraRecord>,
  isNew: boolean,
): CameraRecord[] {
  return clientIds
    .map((id) => cameraRecords[id])
    .filter((r): r is CameraRecord =>
      r != null &&
      r.tracking.isNew === isNew &&
      r.tracking.isDirty &&
      r.tracking.status !== 'saving'
    )
}
