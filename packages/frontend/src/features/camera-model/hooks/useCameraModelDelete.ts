import { useState } from 'react'
import { useDeleteCameraSpec } from '@/api/cameraSpecs'
import { useToast } from '../../../components/ui/Toast'
import type { CameraSpecResponse } from '@/types/camera'

export function useCameraModelDelete() {
  const showToast = useToast()
  const deleteCamera = useDeleteCameraSpec()
  const [deleteTarget, setDeleteTarget] = useState<CameraSpecResponse | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCamera.mutateAsync(deleteTarget.id)
      showToast(`"${deleteTarget.name}" deleted`, 'success')
    } catch {
      showToast('Failed to delete camera specification', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return {
    deleteTarget,
    setDeleteTarget,
    handleDelete,
    isDeleting: deleteCamera.isPending,
  }
}
