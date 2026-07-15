import type { FovCartesian } from '@/lib/fovCalculations'

interface DoriMetricsSectionProps {
  metrics: FovCartesian | null
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] uppercase text-text-secondary">{label}</p>
      <p className="text-xs font-medium tabular-nums text-text-primary">{value}</p>
    </div>
  )
}

function fmt(value: number | null, decimals = 1): string {
  return value != null ? value.toFixed(decimals) : '-'
}

export default function DoriMetricsSection({ metrics }: DoriMetricsSectionProps) {
  return (
    <section className="shrink-0 border-b border-panel-border bg-background px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase text-text-secondary">FOV Metrics</p>
        {metrics?.status === 'valid_dfar_capped' && (
          <span className="text-[10px] text-warning">max range capped at 500 m</span>
        )}
        {metrics?.status === 'invalid_both_rays_up' && (
          <span className="text-[10px] text-error">no ground coverage</span>
        )}
      </div>

      {!metrics || metrics.status === 'invalid_both_rays_up' ? (
        <p className="text-xs text-text-muted">Aim the camera downward to see metrics.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <MetricCell label="H FOV" value={`${fmt(metrics.h_angle)} deg`} />
          <MetricCell label="V FOV" value={`${fmt(metrics.v_angle)} deg`} />
          <MetricCell label="Min range" value={metrics.d_near != null ? `${fmt(metrics.d_near)} m` : '-'} />
          <MetricCell label="Max range" value={metrics.d_far != null ? `${fmt(metrics.d_far)} m` : '-'} />
          <MetricCell label="Width at target" value={metrics.w_target != null ? `${fmt(metrics.w_target)} m` : '-'} />
          <MetricCell label="Coverage area" value={metrics.area != null ? `${Math.round(metrics.area)} m2` : '-'} />
        </div>
      )}
    </section>
  )
}
