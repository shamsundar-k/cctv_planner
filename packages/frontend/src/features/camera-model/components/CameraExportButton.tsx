import { Download } from 'lucide-react'
import { useCameraSpecExport } from '../hooks/useCameraSpecTransfer'

interface Props {
  cameraSpecId: string
}

export default function CameraExportButton({ cameraSpecId }: Props) {
  const exportMutation = useCameraSpecExport()

  return (
    <button
      type="button"
      onClick={() => exportMutation.mutate(cameraSpecId)}
      disabled={exportMutation.isPending}
      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-panel-border bg-background px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-primary/40 hover:bg-divider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
    >
      <Download size={13} aria-hidden="true" />
      {exportMutation.isPending ? 'Exporting…' : 'Export'}
    </button>
  )
}
