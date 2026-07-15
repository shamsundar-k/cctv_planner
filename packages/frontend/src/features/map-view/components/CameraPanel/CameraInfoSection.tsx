import { ReadOnlyField } from './shared'

interface CameraInfoSectionProps {
  modelName: string
  lat: number
  lng: number
}

export default function CameraInfoSection({ modelName, lat, lng }: CameraInfoSectionProps) {
  return (
    <section className="flex shrink-0 flex-col gap-2 border-b border-panel-border bg-background px-4 py-3">
      <ReadOnlyField label="Model" value={modelName} />
      <ReadOnlyField label="Position" value={`${lat.toFixed(6)}, ${lng.toFixed(6)}`} />
    </section>
  )
}
