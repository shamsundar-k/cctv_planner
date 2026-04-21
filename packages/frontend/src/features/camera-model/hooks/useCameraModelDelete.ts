import { useState } from 'react'
import { useDeleteCameraModel } from '../../../api/camerasModels'
import { useToast } from '../../../components/ui/Toast'
import type { CameraModel } from '@/types/cameramodel.types'

export function useCameraModelDelete() {
  const showToast = useToast()
  const deleteCamera = useDeleteCameraModel()
  const [deleteTarget, setDeleteTarget] = useState<CameraModel | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCamera.mutateAsync(deleteTarget.id)
      showToast(`"${deleteTarget.name}" deleted`, 'success')
    } catch {
      showToast('Failed to delete camera model', 'error')
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
