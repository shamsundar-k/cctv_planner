import { useState } from 'react'
import { useAllCameraModels, useDeleteCameraModel } from '../../../api/camerasModels'
import { useToast } from '../../../components/ui/Toast'
import type { CameraModel } from '../../../types/cameramodel.types'

export function useAdminCameras() {
  const showToast = useToast()
  const { data: cameras = [], isLoading } = useAllCameraModels()
  const deleteCamera = useDeleteCameraModel()

  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CameraModel | null>(null)

  const filtered = cameras.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q) ||
      c.model_number.toLowerCase().includes(q)
    )
  })

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
    isLoading,
    filtered,
    search,
    setSearch,
    deleteTarget,
    setDeleteTarget,
    handleDelete,
    isDeleting: deleteCamera.isPending,
  }
}
