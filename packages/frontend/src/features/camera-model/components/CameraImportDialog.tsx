import { useEffect, useRef, useState } from 'react'
import { FileArchive, LoaderCircle, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useToast } from '@/components/ui/Toast'
import { cameraSpecTransferErrorMessages } from '../api/cameraSpecTransfer'
import { useCameraSpecImport } from '../hooks/useCameraSpecTransfer'
import type { CameraSpecImportPreviewResult } from '../types'
import { selectCameraSpecImportTargetId } from '../utils/cameraSpecTransfer'
import CameraImportPreview from './CameraImportPreview'

interface Props {
  onClose: () => void
}

export default function CameraImportDialog({ onClose }: Props) {
  const navigate = useNavigate()
  const showToast = useToast()
  const transfer = useCameraSpecImport()
  const selectionVersion = useRef(0)
  const [archive, setArchive] = useState<File | null>(null)
  const [preview, setPreview] = useState<CameraSpecImportPreviewResult | null>(null)
  const [targetId, setTargetId] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !transfer.isImporting) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, transfer.isImporting])

  async function handleArchiveChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    const version = ++selectionVersion.current
    setArchive(selected)
    setPreview(null)
    setTargetId('')
    setErrors([])
    if (!selected) return

    try {
      const nextPreview = await transfer.previewArchive(selected)
      if (version !== selectionVersion.current) return
      const nextTargetId = selectCameraSpecImportTargetId(nextPreview)
      setPreview(nextPreview)
      setTargetId(nextTargetId)
    } catch (error: unknown) {
      if (version !== selectionVersion.current) return
      setErrors(cameraSpecTransferErrorMessages(error, 'Camera model package could not be validated'))
    }
  }

  async function handleImport() {
    if (!archive || !preview || !targetId) return
    setErrors([])
    try {
      const result = await transfer.importArchive({
        archive,
        mapping: {
          source_id: preview.source_id,
          target_id: targetId,
        },
      })
      showToast(`"${result.camera.name}" imported`, 'success')
      onClose()
      navigate(`/admin/manage/camera_specs/${result.camera.id}`)
    } catch (error: unknown) {
      setErrors(cameraSpecTransferErrorMessages(error, 'Failed to import camera specification'))
    }
  }

  const busy = transfer.isPreviewing || transfer.isImporting

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !transfer.isImporting) onClose()
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="camera-import-title"
      >
        <div className="flex items-center justify-between border-b border-divider px-5 py-4 sm:px-6">
          <div>
            <h2 id="camera-import-title" className="m-0 text-lg font-semibold text-text-primary">
              Import Camera Specification
            </h2>
            <p className="mb-0 mt-1 text-xs text-text-muted">
              Select one CCTV Planner camera-model ZIP package.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={transfer.isImporting}
            aria-label="Close import dialog"
            className="cursor-pointer rounded-lg border-0 bg-transparent p-2 text-text-muted transition-colors hover:bg-divider hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-4 transition-colors hover:bg-primary/10">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileArchive size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-text-primary">
                {archive?.name ?? 'Choose camera-model ZIP'}
              </span>
              <span className="mt-0.5 block text-xs text-text-muted">
                Contents are validated by the server before import.
              </span>
            </span>
            <span className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary">
              Browse
            </span>
            <input
              type="file"
              accept=".zip,application/zip"
              className="sr-only"
              onChange={handleArchiveChange}
              disabled={busy}
            />
          </label>

          {transfer.isPreviewing && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-muted" role="status">
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
              Validating package…
            </div>
          )}

          {!transfer.isPreviewing && preview && (
            <div className="mt-5">
              <CameraImportPreview preview={preview} targetId={targetId} />
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-5 rounded-lg border border-error/35 bg-error/10 px-4 py-3" role="alert">
              <p className="m-0 text-sm font-semibold text-error">Package could not be imported</p>
              <ul className="mb-0 mt-2 space-y-1 pl-5 text-xs text-error">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-divider px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={transfer.isImporting}
            className="cursor-pointer rounded-lg border border-panel-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-divider disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!archive || !preview || !targetId || busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {transfer.isImporting ? (
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload size={16} aria-hidden="true" />
            )}
            {transfer.isImporting ? 'Importing…' : 'Confirm Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
