import { useState, useEffect, useCallback } from 'react'
import { useCameraInstanceStore } from '../../../store/cameraInstanceStore'
import { useSaveNewCameras, useSaveDirtyCameras } from '../../../api/cameraInstances'
import { useToast } from '../../ui/Toast'

interface UseSaveActionReturn {
  isSaving: boolean
  isDirty: boolean
  lastSavedAt: Date | null
  handleSave: () => Promise<void>
}

export function useSaveAction(projectId: string, onSave?: () => Promise<void>): UseSaveActionReturn {
  const [isSaving, setIsSaving] = useState(false)
  // tick forces re-render every 30 s so relative timestamp stays fresh
  const [, setTick] = useState(0)

  const { isDirty, lastSavedAt, markSaved } = useCameraInstanceStore()
  const { saveNewCameras, isSavingNew } = useSaveNewCameras(projectId)
  const saveDirty = useSaveDirtyCameras(projectId)
  const showToast = useToast()

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleSave = useCallback(async () => {
    if (isSaving || isSavingNew || saveDirty.isPending) return
    setIsSaving(true)
    try {
      // POST all temp-ID cameras
      await saveNewCameras()

      // PATCH all modified existing cameras
      const store = useCameraInstanceStore.getState()
      await Promise.all(
        [...store.updatedIds].map((id) =>
          saveDirty.mutateAsync({ cameraId: id, data: store.cameraInstances[id] }),
        ),
      )

      await onSave?.()
      markSaved()
    } catch {
      showToast('Save failed. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, isSavingNew, saveDirty, saveNewCameras, onSave, markSaved, showToast])

  return { isSaving: isSaving || isSavingNew || saveDirty.isPending, isDirty, lastSavedAt, handleSave }
}
