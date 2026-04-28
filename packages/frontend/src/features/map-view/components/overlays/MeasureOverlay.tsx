import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import L from 'leaflet'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore } from '@/store/mapActionsSlice'

type Point = { lat: number; lng: number }

function toRad(deg: number) { return (deg * Math.PI) / 180 }

function haversine(a: Point, b: Point): number {
  const R = 6_371_000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

function totalDist(pts: Point[]): number {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += haversine(pts[i - 1], pts[i])
  return d
}

function formatDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`
}

export default function MeasureOverlay() {
  const { mapRef } = useMapContext()
  const setActiveTool = useMapActionsStore((s) => s.setActiveTool)
  const [points, setPoints] = useState<Point[]>([])

  // Redraw Leaflet layers whenever points change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const layers: L.Layer[] = []

    if (points.length >= 2) {
      layers.push(
        L.polyline(points.map(p => [p.lat, p.lng] as [number, number]), {
          color: '#F59E0B',
          weight: 2,
          dashArray: '6 4',
        }).addTo(map),
      )
    }

    points.forEach((p, i) => {
      layers.push(
        L.circleMarker([p.lat, p.lng], {
          radius: 4,
          color: '#F59E0B',
          fillColor: '#F59E0B',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map),
      )

      if (i > 0) {
        const mid: Point = { lat: (points[i - 1].lat + p.lat) / 2, lng: (points[i - 1].lng + p.lng) / 2 }
        const d = haversine(points[i - 1], p)
        layers.push(
          L.marker([mid.lat, mid.lng], {
            icon: L.divIcon({
              className: '',
              html: `<div style="background:rgba(0,0,0,0.65);color:#fff;font-size:10px;padding:1px 5px;border-radius:4px;white-space:nowrap">${formatDist(d)}</div>`,
              iconAnchor: [0, 8],
            }),
          }).addTo(map),
        )
      }
    })

    return () => { layers.forEach(l => l.remove()) }
  }, [points]) // eslint-disable-line react-hooks/exhaustive-deps

  // Click to add waypoint
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = (e: L.LeafletMouseEvent) =>
      setPoints(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [mapRef])

  // Reticle cursor
  useEffect(() => {
    const container = mapRef.current?.getContainer()
    if (!container) return
    container.style.cursor = 'crosshair'
    return () => { container.style.cursor = '' }
  }, [mapRef])

  // ESC to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveTool('pan') }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool])

  const total = totalDist(points)

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2.5 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg text-sm whitespace-nowrap"
      style={{ background: 'var(--theme-bg-card)', border: '1px solid color-mix(in srgb, var(--theme-accent) 40%, transparent)' }}
    >
      <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Measure Distance</span>
      {points.length >= 2 && (
        <span className="text-xs font-mono" style={{ color: 'var(--theme-accent)' }}>{formatDist(total)}</span>
      )}
      {points.length === 0 && (
        <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Click on the map to start</span>
      )}
      {points.length > 0 && (
        <button
          onClick={() => setPoints([])}
          className="text-xs px-2 py-0.5 rounded"
          style={{ color: 'var(--theme-text-secondary)', background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
        >
          Clear
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
  )
}
