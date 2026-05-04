import type React from 'react'
import type { FovCartesian } from '@/lib/fovCalculations'

interface DoriMetricsSectionProps {
  metrics: FovCartesian | null
}

const sectionBorder: React.CSSProperties = {
  borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{label}</p>
      <p className="text-xs font-medium tabular-nums" style={{ color: 'var(--theme-text-primary)' }}>{value}</p>
    </div>
  )
}

function fmt(v: number | null, decimals = 1): string {
  return v != null ? v.toFixed(decimals) : '—'
}

export default function DoriMetricsSection({ metrics }: DoriMetricsSectionProps) {
  return (
    <section
      className="px-4 py-3 border-b shrink-0"
      style={{ ...sectionBorder, background: 'color-mix(in srgb, var(--theme-surface) 5%, transparent)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
          FOV Metrics
        </p>
        {metrics?.status === 'valid_dfar_capped' && (
          <span className="text-[10px] text-amber-400">max range capped at 500 m</span>
        )}
        {metrics?.status === 'invalid_both_rays_up' && (
          <span className="text-[10px] text-red-400">no ground coverage</span>
        )}
      </div>

      {!metrics || metrics.status === 'invalid_both_rays_up' ? (
        <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>
          Aim the camera downward to see metrics.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <MetricCell label="H FOV" value={`${fmt(metrics.h_angle)}°`} />
          <MetricCell label="V FOV" value={`${fmt(metrics.v_angle)}°`} />
          <MetricCell label="Min range" value={metrics.d_near != null ? `${fmt(metrics.d_near)} m` : '—'} />
          <MetricCell label="Max range" value={metrics.d_far != null ? `${fmt(metrics.d_far)} m` : '—'} />
          <MetricCell label="Width at target" value={metrics.w_target != null ? `${fmt(metrics.w_target)} m` : '—'} />
          <MetricCell label="Coverage area" value={metrics.area != null ? `${Math.round(metrics.area)} m²` : '—'} />
        </div>
      )}
    </section>
  )
}
