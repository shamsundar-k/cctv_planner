import type { CameraSpec, CameraSpecRecord } from '@/types/camera'

export interface CameraSpecImportValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface CameraSpecImportImagePreview {
  content_type: 'image/webp'
  data_base64: string
  sha256: string
  source: 'custom' | 'default'
}

export interface CameraSpecImportPreviewResult {
  model: CameraSpec
  image: CameraSpecImportImagePreview
  source_id: string | null
  source_id_available: boolean | null
  suggested_target_id: string | null
  requires_new_id: boolean
  validation: CameraSpecImportValidation
}

export interface CameraSpecImportIdMapping {
  source_id: string | null
  target_id: string
}

export interface CameraSpecImportResult {
  camera: CameraSpecRecord
  mapping: CameraSpecImportIdMapping
}

export interface CameraSpecExportDownload {
  blob: Blob
  filename: string
}
