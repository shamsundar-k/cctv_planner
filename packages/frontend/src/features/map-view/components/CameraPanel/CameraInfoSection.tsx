import { ReadOnlyField } from './shared'

interface CameraInfoSectionProps {
  modelName: string
  lat: number
  lng: number
}

export default function CameraInfoSection({ modelName, lat, lng }: CameraInfoSectionProps) {
  return (
    <section
      className="px-4 py-3 border-b shrink-0 flex flex-col gap-2"
      style={{
        borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
        background: 'color-mix(in srgb, var(--theme-surface) 5%, transparent)',
      }}
    >
      <ReadOnlyField label="Model" value={modelName} />
      <ReadOnlyField label="Position" value={`${lat.toFixed(6)}, ${lng.toFixed(6)}`} />
    </section>
  )
}
