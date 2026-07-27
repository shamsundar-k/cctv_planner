import type { CameraPlacement, CameraSpecRecord } from '@/types/camera'
import type { FovCartesian } from '@/lib/fovCalculations'

interface Props {
  camera: CameraPlacement
  model: CameraSpecRecord | null
  metrics: FovCartesian | null
}

function fmt(value: number | null, unit: string, decimals = 1) {
  return value == null ? '-' : `${value.toFixed(decimals)} ${unit}`
}

export default function CameraDetailsSection({ camera, model, metrics }: Props) {
  return (
    <details className="shrink-0 border-b border-panel-border bg-background">
      <summary className="cursor-pointer select-none px-4 py-2 text-[11px] font-semibold uppercase text-text-secondary hover:text-text-primary">
        Camera details &amp; calculated FOV
      </summary>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-panel-border px-4 py-3 text-xs">
        <div><span className="block text-[10px] uppercase text-text-muted">Make</span>{model?.manufacturer ?? '-'}</div>
        <div><span className="block text-[10px] uppercase text-text-muted">Model</span>{model?.model ?? model?.name ?? '-'}</div>
        <div className="col-span-2 truncate"><span className="block text-[10px] uppercase text-text-muted">Position</span>{camera.location.latitude.toFixed(6)}, {camera.location.longitude.toFixed(6)}</div>
        <div><span className="block text-[10px] uppercase text-text-muted">Horizontal FOV</span>{fmt(metrics?.h_angle ?? null, '°')}</div>
        <div><span className="block text-[10px] uppercase text-text-muted">Vertical FOV</span>{fmt(metrics?.v_angle ?? null, '°')}</div>
        <div><span className="block text-[10px] uppercase text-text-muted">Near range</span>{fmt(metrics?.d_near ?? null, 'm')}</div>
        <div><span className="block text-[10px] uppercase text-text-muted">Far range</span>{fmt(metrics?.d_far ?? null, 'm')}</div>
        <div><span className="block text-[10px] uppercase text-text-muted">Coverage</span>{fmt(metrics?.area ?? null, 'm²', 0)}</div>
        <div><span className="block text-[10px] uppercase text-text-muted">Tilt</span>{fmt(metrics?.tilt_angle ?? null, '°')}</div>
      </div>
    </details>
  )
}
