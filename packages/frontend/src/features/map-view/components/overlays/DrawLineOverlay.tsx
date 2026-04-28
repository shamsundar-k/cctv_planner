import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import L from 'leaflet'
import { useParams } from 'react-router'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import { useCreateZone } from '@/api/zones'
import type { ZoneType } from '@/types/zone.types'

type Point = { lat: number; lng: number }

const ZONE_COLOURS: Record<ZoneType, string> = {
  coverage_area: '#10B981',
  exclusion: '#EF4444',
  annotation: '#F59E0B',
}

export default function DrawLineOverlay() {
  const { mapRef } = useMapContext()
  const { id: projectId = '' } = useParams<{ id: string }>()
  const setActiveTool = useMapActionsStore((s) => s.setActiveTool)
  const createZone = useCreateZone(projectId)

  const [points, setPoints] = useState<Point[]>([])
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState('Line')
  const [zoneType, setZoneType] = useState<ZoneType>('annotation')
  const [readyToSave, setReadyToSave] = useState(false)
  const colour = ZONE_COLOURS[zoneType]

  // Redraw preview whenever points change
  useEffect(() => {
    const map = mapRef.current
    if (!map || points.length < 1) return
    const layers: L.Layer[] = []

    if (points.length >= 2) {
      layers.push(
        L.polyline(points.map(p => [p.lat, p.lng] as [number, number]), {
          color: colour, weight: 2, dashArray: '6 4',
        }).addTo(map),
      )
    }

    points.forEach(p => {
      layers.push(
        L.circleMarker([p.lat, p.lng], {
          radius: 4, color: colour, fillColor: colour, fillOpacity: 1, weight: 2,
        }).addTo(map),
      )
    })

    return () => { layers.forEach(l => l.remove()) }
  }, [points, colour]) // eslint-disable-line react-hooks/exhaustive-deps

  // Click to add waypoints
  useEffect(() => {
    const map = mapRef.current
    if (!map || readyToSave) return
    const handler = (e: L.LeafletMouseEvent) =>
      setPoints(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [mapRef, readyToSave])

  // Cursor
  useEffect(() => {
    const container = mapRef.current?.getContainer()
    if (!container) return
    container.style.cursor = 'crosshair'
    return () => { container.style.cursor = '' }
  }, [mapRef])

  // ESC to cancel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveTool('pan') }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool])

  async function handleSave() {
    if (points.length < 2) return
    setSaving(true)
    try {
      await createZone.mutateAsync({
        label: label.trim() || 'Line',
        zone_type: zoneType,
        colour,
        geojson: { type: 'LineString', coordinates: points.map(p => [p.lng, p.lat]) },
      })
      setActiveTool('pan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg text-sm whitespace-nowrap"
        style={{ background: 'var(--theme-bg-card)', border: `1px solid color-mix(in srgb, ${colour} 40%, transparent)` }}
      >
        <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
          Draw Line
          {points.length > 0 && (
            <span className="font-normal text-xs ml-2" style={{ color: 'var(--theme-text-secondary)' }}>
              {points.length} pts
            </span>
          )}
        </span>
        {!readyToSave && points.length >= 2 && (
          <button
            onClick={() => setReadyToSave(true)}
            className="px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ background: colour }}
          >
            Finish
          </button>
        )}
        <button
          onClick={() => setActiveTool('pan')}
          className="ml-1 flex items-center justify-center rounded-md p-0.5 transition-colors"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <X size={14} />
        </button>
      </div>

      {readyToSave && (
        <div
          className="flex flex-col gap-2.5 px-4 py-3 rounded-xl backdrop-blur-md shadow-lg w-64"
          style={{ background: 'var(--theme-bg-card)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
        >
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-secondary)' }}>Save Line</p>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Line label"
            className="rounded-md text-xs px-2 py-1.5 w-full focus:outline-none"
            style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 35%, transparent)', color: 'var(--theme-text-primary)' }}
          />
          <select
            value={zoneType}
            onChange={e => setZoneType(e.target.value as ZoneType)}
            className="rounded-md text-xs px-2 py-1.5 w-full focus:outline-none"
            style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 35%, transparent)', color: 'var(--theme-text-primary)' }}
          >
            <option value="coverage_area">Coverage Area</option>
            <option value="exclusion">Exclusion Zone</option>
            <option value="annotation">Annotation</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-1.5 rounded-md text-xs font-bold text-white"
              style={{ background: colour, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Line'}
            </button>
            <button
              onClick={() => setReadyToSave(false)}
              className="px-3 py-1.5 rounded-md text-xs"
              style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', color: 'var(--theme-text-secondary)' }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
