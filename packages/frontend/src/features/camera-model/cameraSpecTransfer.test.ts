import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import client from '@/api/client'
import { cameraSpecKeys } from '@/hooks/useCameraSpecs'
import type { CameraSpec, CameraSpecRecord } from '@/types/camera'
import {
  cameraSpecTransferErrorMessages,
  exportCameraSpec,
  importCameraSpec,
  previewCameraSpecImport,
} from './api/cameraSpecTransfer'
import { refreshImportedCameraSpec, saveArchive } from './hooks/useCameraSpecTransfer'
import type { CameraSpecImportPreviewResult } from './types'
import { createCameraSpecId } from './utils/cameraSpecId'
import { selectCameraSpecImportTargetId } from './utils/cameraSpecTransfer'

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const model: CameraSpec = {
  name: 'Dome 2MP',
  manufacturer: 'Hikvision',
  model: 'DS-2CD1123G0-I',
  camera_type: 'dome',
  lens_spec: {
    lens_type: 'fixed',
    focal_length: { min: 2.8, max: 2.8 },
    h_fov: { min: 105, max: 105 },
    v_fov: { min: 56, max: 56 },
  },
  sensor_spec: {
    resolution: { horizontal: 1920, vertical: 1080 },
    megapixel: 2,
    sensor_size: '1/2.8 inch',
  },
  ir_range: 30,
}

const camera: CameraSpecRecord = {
  ...model,
  id: '66584aef0f5f3e6d8f8a1234',
  image_storage_key: 'camera-specs/66584aef0f5f3e6d8f8a1234.webp',
  image_version: 1,
  image_updated_at: '2026-09-03T00:00:00Z',
  created_at: '2026-09-03T00:00:00Z',
  updated_at: '2026-09-03T00:00:00Z',
}

function preview(overrides: Partial<CameraSpecImportPreviewResult> = {}): CameraSpecImportPreviewResult {
  return {
    model,
    image: {
      content_type: 'image/webp',
      data_base64: 'aW1hZ2U=',
      sha256: '0'.repeat(64),
      source: 'custom',
    },
    source_id: camera.id,
    source_id_available: true,
    suggested_target_id: camera.id,
    requires_new_id: false,
    validation: { valid: true, errors: [], warnings: [] },
    ...overrides,
  }
}

describe('camera model transfer API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the archive and server-provided download filename', async () => {
    const blob = new Blob(['zip'], { type: 'application/zip' })
    vi.mocked(client.get).mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="camera.zip"' },
    } as never)

    await expect(exportCameraSpec('id/with slash')).resolves.toEqual({
      blob,
      filename: 'camera.zip',
    })
    expect(client.get).toHaveBeenCalledWith('/camera-specs/id%2Fwith%20slash/export', {
      responseType: 'blob',
    })
  })

  it('uploads the archive for preview', async () => {
    const archive = new File(['zip'], 'camera.zip', { type: 'application/zip' })
    const result = preview()
    vi.mocked(client.post).mockResolvedValue({ data: result } as never)

    await expect(previewCameraSpecImport(archive)).resolves.toBe(result)
    const [, form] = vi.mocked(client.post).mock.calls[0]
    expect(form).toBeInstanceOf(FormData)
    expect((form as FormData).get('archive')).toBe(archive)
  })

  it('uploads the selected source-to-target mapping for import', async () => {
    const archive = new File(['zip'], 'camera.zip', { type: 'application/zip' })
    const mapping = { source_id: camera.id, target_id: '66584b9a0f5f3e6d8f8a5678' }
    const result = { camera, mapping }
    vi.mocked(client.post).mockResolvedValue({ data: result } as never)

    await expect(importCameraSpec(archive, mapping)).resolves.toBe(result)
    const [, form] = vi.mocked(client.post).mock.calls[0]
    expect((form as FormData).get('archive')).toBe(archive)
    expect((form as FormData).get('id_mapping')).toBe(JSON.stringify(mapping))
  })
})

describe('camera model transfer state decisions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reuses an available source ID without generating another ID', () => {
    const createId = vi.fn(() => 'replacement')
    expect(selectCameraSpecImportTargetId(preview(), createId)).toBe(camera.id)
    expect(createId).not.toHaveBeenCalled()
  })

  it('generates a replacement ID for source conflicts', () => {
    const replacement = '66584b9a0f5f3e6d8f8a5678'
    const createId = vi.fn(() => replacement)
    const conflict = preview({
      source_id_available: false,
      suggested_target_id: null,
      requires_new_id: true,
    })

    expect(selectCameraSpecImportTargetId(conflict, createId)).toBe(replacement)
    expect(createId).toHaveBeenCalledOnce()
  })

  it('creates a 24-character ObjectId-compatible frontend ID', () => {
    vi.spyOn(Date, 'now').mockReturnValue(0x112345678 * 1000)
    vi.stubGlobal('crypto', {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.set([0, 1, 2, 3, 4, 5, 6, 255])
        return bytes
      },
    })

    expect(createCameraSpecId()).toBe('1234567800010203040506ff')
  })

  it('downloads and then releases an exported archive', () => {
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    }
    const appendChild = vi.fn()
    vi.stubGlobal('document', {
      createElement: vi.fn(() => anchor),
      body: { appendChild },
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:camera-export')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)

    saveArchive(new Blob(['zip']), 'camera.zip')

    expect(anchor.href).toBe('blob:camera-export')
    expect(anchor.download).toBe('camera.zip')
    expect(appendChild).toHaveBeenCalledWith(anchor)
    expect(anchor.click).toHaveBeenCalledOnce()
    expect(anchor.remove).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:camera-export')
  })

  it('updates the imported detail cache and invalidates the camera list', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(cameraSpecKeys.all, [])

    await refreshImportedCameraSpec(queryClient, camera)

    expect(queryClient.getQueryData(cameraSpecKeys.detail(camera.id))).toEqual(camera)
    expect(queryClient.getQueryState(cameraSpecKeys.all)?.isInvalidated).toBe(true)
  })

  it('surfaces validation details and falls back for unknown import failures', () => {
    expect(cameraSpecTransferErrorMessages({
      response: { data: { detail: { errors: ['Invalid archive', 'Corrupt image'] } } },
    }, 'Fallback')).toEqual(['Invalid archive', 'Corrupt image'])
    expect(cameraSpecTransferErrorMessages(new Error('network'), 'Import failed')).toEqual([
      'Import failed',
    ])
  })
})
