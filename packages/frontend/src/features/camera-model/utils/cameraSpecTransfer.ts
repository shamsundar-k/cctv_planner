import type { CameraSpecImportPreviewResult } from '../types'
import { createCameraSpecId } from './cameraSpecId'

export function selectCameraSpecImportTargetId(
  preview: CameraSpecImportPreviewResult,
  createId: () => string = createCameraSpecId,
): string {
  return preview.suggested_target_id ?? createId()
}
