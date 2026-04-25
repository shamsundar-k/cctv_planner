import { Camera, Plus, Ruler, Spline, Pentagon } from 'lucide-react'
import MapActionButton from './MapActionButton'

function PlaceCameraIcon() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <Camera size={15} />
      <Plus
        size={8}
        strokeWidth={3}
        className="absolute -top-1 -right-1"
        style={{ color: 'var(--theme-accent)' }}
      />
    </span>
  )
}

const DIVIDER = (
  <div
    className="w-px h-4 mx-0.5 flex-shrink-0"
    style={{ background: 'color-mix(in srgb, var(--theme-surface) 40%, transparent)' }}
  />
)

export default function MapActionsToolbar() {
  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
      style={{
        zIndex: 1000,
        background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)',
        border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 16px color-mix(in srgb, var(--theme-bg-base) 50%, transparent)',
      }}
    >
      <MapActionButton icon={<PlaceCameraIcon />} label="Place Camera" />

      {DIVIDER}

      <MapActionButton icon={<Ruler size={15} />} label="Measure Distance" />
      <MapActionButton icon={<Spline size={15} />} label="Draw Line" />
      <MapActionButton icon={<Pentagon size={15} />} label="Draw Polygon" />
    </div>
  )
}
