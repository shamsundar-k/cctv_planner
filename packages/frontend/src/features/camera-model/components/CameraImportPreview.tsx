import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { CameraSpecImportPreviewResult } from '../types'

interface Props {
  preview: CameraSpecImportPreviewResult
  targetId: string
}

function idAvailabilityLabel(preview: CameraSpecImportPreviewResult): string {
  if (preview.source_id_available === true) return 'Source ID is available'
  if (preview.source_id_available === false) return 'Source ID conflict'
  return 'No source ID in package'
}

export default function CameraImportPreview({ preview, targetId }: Props) {
  const replacementUsed = preview.source_id !== targetId

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-panel-border bg-background/60 p-4 sm:grid-cols-[140px_1fr]">
        <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-panel-border bg-panel">
          <img
            src={`data:${preview.image.content_type};base64,${preview.image.data_base64}`}
            alt={`${preview.model.name} import preview`}
            className="h-full w-full object-contain p-2"
          />
        </div>
        <div className="min-w-0">
          <h3 className="m-0 truncate text-base font-semibold text-text-primary">
            {preview.model.name}
          </h3>
          <p className="mb-3 mt-1 text-sm text-text-muted">
            {preview.model.manufacturer} · {preview.model.model}
          </p>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-text-muted">Type</dt>
            <dd className="m-0 capitalize text-text-primary">{preview.model.camera_type}</dd>
            <dt className="text-text-muted">Resolution</dt>
            <dd className="m-0 text-text-primary">
              {preview.model.sensor_spec.resolution.horizontal} ×{' '}
              {preview.model.sensor_spec.resolution.vertical}
            </dd>
            <dt className="text-text-muted">Image</dt>
            <dd className="m-0 capitalize text-text-primary">{preview.image.source}</dd>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-panel-border p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
          {preview.source_id_available === true ? (
            <CheckCircle2 size={17} className="text-success" aria-hidden="true" />
          ) : (
            <AlertTriangle size={17} className="text-warning" aria-hidden="true" />
          )}
          {idAvailabilityLabel(preview)}
        </div>
        <dl className="m-0 grid gap-2 text-xs sm:grid-cols-[110px_1fr]">
          <dt className="text-text-muted">Source ID</dt>
          <dd className="m-0 break-all font-mono text-text-primary">
            {preview.source_id ?? 'Not provided'}
          </dd>
          <dt className="text-text-muted">Target ID</dt>
          <dd className="m-0 break-all font-mono text-text-primary">{targetId}</dd>
        </dl>
        {replacementUsed && (
          <p className="mb-0 mt-3 text-xs text-warning">
            A new destination ID was generated in this browser.
          </p>
        )}
      </div>

      {preview.validation.warnings.length > 0 && (
        <ul className="m-0 space-y-1 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
          {preview.validation.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
