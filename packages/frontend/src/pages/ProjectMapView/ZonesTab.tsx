import { Trash2 } from 'lucide-react'
import { useZones, useDeleteZone } from '@/api/zones'
import type { ZoneType } from '@/types/zone.types'

const TYPE_LABELS: Record<ZoneType, string> = {
  coverage_area: 'Coverage',
  exclusion: 'Exclusion',
  annotation: 'Annotation',
}

interface ZonesTabProps {
  projectId: string
}

export default function ZonesTab({ projectId }: ZonesTabProps) {
  const { data: zones, isLoading } = useZones(projectId)
  const deleteZone = useDeleteZone(projectId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 pt-1 px-2">
        {[1, 2].map(i => (
          <div
            key={i}
            className="h-8 rounded animate-pulse"
            style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
          />
        ))}
      </div>
    )
  }

  if (!zones || zones.length === 0) {
    return (
      <p className="text-xs italic px-2 pt-2 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>
        No zones drawn yet. Use the Draw Polygon or Draw Line tool.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {zones.map(zone => (
        <li key={zone.id}>
          <div
            className="flex items-center gap-2 h-8 px-2 rounded group"
            style={{ color: 'color-mix(in srgb, var(--theme-text-primary) 70%, transparent)' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: zone.colour }}
            />
            <span className="flex-1 text-xs truncate select-none">{zone.label}</span>
            <span
              className="text-[10px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              {TYPE_LABELS[zone.zone_type]}
            </span>
            <button
              onClick={() => deleteZone.mutate(zone.id)}
              className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--theme-text-secondary)' }}
              title="Delete zone"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
