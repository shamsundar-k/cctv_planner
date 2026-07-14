import { Image as ImageIcon, RotateCcw, Trash2, Upload, X } from 'lucide-react'
import type { CameraSpecRecord } from '@/types/camera'
import CollapsibleSection from '@/components/ui/CollapsibleSection'
import CameraSpecImage from '../CameraSpecImage'
import type { CameraImageInputState } from '../../hooks/useCameraImageInput'

interface Props {
  camera?: CameraSpecRecord
  image: CameraImageInputState
}

export default function CameraImageSection({ camera, image }: Props) {
  const hasCustomImage = Boolean(camera?.image_storage_key)

  return (
    <CollapsibleSection title="Camera Image">
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        <div className="w-full sm:w-48 aspect-square shrink-0">
          {image.previewUrl ? (
            <div className="h-full overflow-hidden rounded-lg border border-panel-border bg-background">
              <img
                src={image.previewUrl}
                alt="Selected camera preview"
                className="h-full w-full object-contain p-3"
              />
            </div>
          ) : camera ? (
            <div className={`h-full ${image.removeRequested ? 'opacity-40' : ''}`}>
              <CameraSpecImage camera={camera} className="h-full rounded-lg" />
            </div>
          ) : (
            <div className="h-full rounded-lg flex flex-col items-center justify-center gap-2 border border-dashed border-panel-border bg-background text-text-muted">
              <ImageIcon size={30} aria-hidden="true" />
              <span className="text-xs">Type default</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text-primary">
            {image.file?.name ??
              (image.removeRequested ? 'Default image selected' : hasCustomImage ? 'Custom image' : 'Type default image')}
          </div>
          <p className="mb-4 mt-1 text-xs text-text-muted">JPEG, PNG or WebP · up to 5 MB</p>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
              <Upload size={15} aria-hidden="true" />
              {camera || image.file ? 'Replace image' : 'Choose image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  image.selectFile(event.target.files?.[0] ?? null)
                  event.target.value = ''
                }}
              />
            </label>

            {image.file && (
              <button
                type="button"
                onClick={image.clearFile}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-panel-border bg-background px-3 text-xs font-semibold text-text-primary transition-colors hover:bg-divider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X size={15} aria-hidden="true" />
                Clear selection
              </button>
            )}

            {hasCustomImage && !image.file && !image.removeRequested && (
              <button
                type="button"
                onClick={image.requestRemoval}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-error/40 bg-error/10 px-3 text-xs font-semibold text-error transition-colors hover:bg-error/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
              >
                <Trash2 size={15} aria-hidden="true" />
                Remove custom image
              </button>
            )}

            {image.removeRequested && (
              <button
                type="button"
                onClick={image.cancelRemoval}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-panel-border bg-background px-3 text-xs font-semibold text-text-primary transition-colors hover:bg-divider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Keep custom image
              </button>
            )}
          </div>

          {image.error && <p className="text-xs text-error mt-2 mb-0">{image.error}</p>}
        </div>
      </div>
    </CollapsibleSection>
  )
}
