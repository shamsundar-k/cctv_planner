import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'
import { cameraSpecKeys } from '@/hooks/useCameraSpecs'
import type { CameraSpecRecord } from '@/types/camera'
import {
  cameraSpecTransferErrorMessages,
  exportCameraSpec,
  importCameraSpec,
  previewCameraSpecImport,
} from '../api/cameraSpecTransfer'
import type { CameraSpecImportIdMapping } from '../types'

export function saveArchive(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function refreshImportedCameraSpec(
  queryClient: QueryClient,
  camera: CameraSpecRecord,
): Promise<void> {
  queryClient.setQueryData(cameraSpecKeys.detail(camera.id), camera)
  await queryClient.invalidateQueries({ queryKey: cameraSpecKeys.all })
}

export function useCameraSpecExport() {
  const showToast = useToast()
  return useMutation({
    mutationFn: exportCameraSpec,
    onSuccess: ({ blob, filename }) => {
      saveArchive(blob, filename)
    },
    onError: (error) => {
      showToast(
        cameraSpecTransferErrorMessages(error, 'Failed to export camera specification')[0],
        'error',
      )
    },
    retry: 0,
  })
}

export function useCameraSpecImport() {
  const queryClient = useQueryClient()
  const previewMutation = useMutation({
    mutationFn: previewCameraSpecImport,
    retry: 0,
  })
  const importMutation = useMutation({
    mutationFn: ({ archive, mapping }: { archive: File; mapping: CameraSpecImportIdMapping }) =>
      importCameraSpec(archive, mapping),
    onSuccess: async ({ camera }) => refreshImportedCameraSpec(queryClient, camera),
    retry: 0,
  })

  return {
    previewArchive: previewMutation.mutateAsync,
    importArchive: importMutation.mutateAsync,
    isPreviewing: previewMutation.isPending,
    isImporting: importMutation.isPending,
  }
}
