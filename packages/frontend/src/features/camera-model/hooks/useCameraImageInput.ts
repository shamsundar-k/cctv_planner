import { useEffect, useState } from 'react'

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export interface CameraImageInputState {
  file: File | null
  previewUrl: string | null
  error: string | null
  removeRequested: boolean
  selectFile: (file: File | null) => void
  clearFile: () => void
  requestRemoval: () => void
  cancelRemoval: () => void
}

export function useCameraImageInput(): CameraImageInputState {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [removeRequested, setRemoveRequested] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function selectFile(nextFile: File | null) {
    setError(null)
    if (!nextFile) return
    if (!ACCEPTED_IMAGE_TYPES.has(nextFile.type)) {
      setError('Choose a JPEG, PNG, or WebP image')
      return
    }
    if (nextFile.size > MAX_IMAGE_BYTES) {
      setError('Image must be 5 MB or smaller')
      return
    }

    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
    setRemoveRequested(false)
  }

  function clearFile() {
    setFile(null)
    setPreviewUrl(null)
    setError(null)
  }

  function requestRemoval() {
    clearFile()
    setRemoveRequested(true)
  }

  return {
    file,
    previewUrl,
    error,
    removeRequested,
    selectFile,
    clearFile,
    requestRemoval,
    cancelRemoval: () => setRemoveRequested(false),
  }
}
