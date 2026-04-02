/*
 * FILE SUMMARY — src/api/cameraInstances.ts
 *
 * The camera instance data lifecycle is now fully owned by useCameraInstanceStore.
 * - Loading: store.loadCameras(projectId)  — called once on page mount
 * - Saving:  store.saveAll(projectId)      — called from the Save button
 *
 * This file is retained for query key constants shared across the app.
 */

export const cameraInstanceKeys = {
  list: (projectId: string) => ['cameraInstances', projectId] as const,
  detail: (projectId: string, cameraId: string) => ['cameraInstances', projectId, cameraId] as const,
}
