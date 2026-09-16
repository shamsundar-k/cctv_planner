import { useState, useEffect, useCallback } from 'react'
import { useCameraStore } from '../../../store/cameraStore'
import { useToast } from '../../../components/ui/Toast'
import { useMapDrawingStore } from '@/features/map-drawing'

interface UseSaveActionReturn {
  isSaving: boolean
  isDirty: boolean
  lastSavedAt: Date | null
  handleSave: () => Promise<void>
}

export function useSaveAction(projectId: string, onSave?: () => Promise<void>): UseSaveActionReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  // tick forces re-render every 30 s so relative timestamp stays fresh
  const [, setTick] = useState(0)

  const camerasAreDirty = useCameraStore((state) => state.getIsDirty())
  const drawingsAreDirty = useMapDrawingStore((state) => state.getIsDirty())
  const saveCameras = useCameraStore((state) => state.saveAll)
  const saveDrawings = useMapDrawingStore((state) => state.saveAll)
  const isDirty = camerasAreDirty || drawingsAreDirty
  const showToast = useToast()

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await Promise.all([
        saveCameras(projectId),
        saveDrawings(projectId),
      ])
      await onSave?.()
      setLastSavedAt(new Date())
    } catch {
      showToast('Save failed. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, saveCameras, saveDrawings, projectId, onSave, showToast])

  return { isSaving, isDirty, lastSavedAt, handleSave }
}
