import { useState, useEffect, useCallback } from 'react'
import { useCameraInstanceStore } from '../../../store/cameraInstanceStore'
import { useToast } from '../../ui/Toast'

interface UseSaveActionReturn {
  isSaving: boolean
  isDirty: boolean
  lastSavedAt: Date | null
  handleSave: () => Promise<void>
}

export function useSaveAction(onSave?: () => Promise<void>): UseSaveActionReturn {
  const [isSaving, setIsSaving] = useState(false)
  // tick forces re-render every 30 s so relative timestamp stays fresh
  const [, setTick] = useState(0)

  const { isDirty, lastSavedAt, markSaved } = useCameraInstanceStore()
  const showToast = useToast()

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await onSave?.()
      markSaved()
    } catch {
      showToast('Save failed. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSave, markSaved, showToast])

  return { isSaving, isDirty, lastSavedAt, handleSave }
}
