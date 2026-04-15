import { useState, useEffect, useCallback } from 'react'
import { useCameraInstanceStore } from '../../../../store/cameraInstanceStore'
import { useToast } from '../../../../components/ui/Toast'

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

  const getIsDirty = useCameraInstanceStore((s) => s.getIsDirty)
  const saveAll = useCameraInstanceStore((s) => s.saveAll)
  const showToast = useToast()

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await saveAll(projectId)
      await onSave?.()
      setLastSavedAt(new Date())
    } catch {
      showToast('Save failed. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, saveAll, projectId, onSave, showToast])

  return { isSaving, isDirty: getIsDirty(), lastSavedAt, handleSave }
}
