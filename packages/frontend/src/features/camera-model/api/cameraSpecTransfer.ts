import client from '@/api/client'
import type {
  CameraSpecExportDownload,
  CameraSpecImportIdMapping,
  CameraSpecImportPreviewResult,
  CameraSpecImportResult,
} from '../types'

function responseFilename(contentDisposition: unknown, fallback: string): string {
  if (typeof contentDisposition !== 'string') return fallback
  const match = contentDisposition.match(/filename="?([^";]+)"?/i)
  return match?.[1]?.trim() || fallback
}

function archiveFormData(archive: File): FormData {
  const form = new FormData()
  form.append('archive', archive)
  return form
}

export async function exportCameraSpec(cameraSpecId: string): Promise<CameraSpecExportDownload> {
  const response = await client.get<Blob>(
    `/camera-specs/${encodeURIComponent(cameraSpecId)}/export`,
    { responseType: 'blob' },
  )
  return {
    blob: response.data,
    filename: responseFilename(
      response.headers['content-disposition'],
      `camera-model-${cameraSpecId}.zip`,
    ),
  }
}

export async function previewCameraSpecImport(
  archive: File,
): Promise<CameraSpecImportPreviewResult> {
  const response = await client.post<CameraSpecImportPreviewResult>(
    '/camera-specs/import/preview',
    archiveFormData(archive),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export async function importCameraSpec(
  archive: File,
  mapping: CameraSpecImportIdMapping,
): Promise<CameraSpecImportResult> {
  const form = archiveFormData(archive)
  form.append('id_mapping', JSON.stringify(mapping))
  const response = await client.post<CameraSpecImportResult>('/camera-specs/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export function cameraSpecTransferErrorMessages(error: unknown, fallback: string): string[] {
  const detail = (
    error as {
      response?: { data?: { detail?: string | { errors?: unknown } } }
    }
  )?.response?.data?.detail

  if (typeof detail === 'string') return [detail]
  if (detail && Array.isArray(detail.errors)) {
    const messages = detail.errors.filter((item): item is string => typeof item === 'string')
    if (messages.length > 0) return messages
  }
  return [fallback]
}
