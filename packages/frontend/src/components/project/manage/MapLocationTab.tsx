import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import type { Project, UpdateProjectDTO } from '../../../api/projects'
import { useUpdateProject } from '../../../api/projects'
import { useToast } from '../../ui/Toast'

interface MapLocationTabProps {
  project: Project
}

const DEFAULT_LAT = 12.9716
const DEFAULT_LNG = 77.5946
const DEFAULT_ZOOM = 13

export default function MapLocationTab({ project }: MapLocationTabProps) {
  const showToast = useToast()
  const updateProject = useUpdateProject()
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [lat, setLat] = useState<number>(project.center_lat ?? DEFAULT_LAT)
  const [lng, setLng] = useState<number>(project.center_lng ?? DEFAULT_LNG)
  const [zoom, setZoom] = useState<number>(project.default_zoom ?? DEFAULT_ZOOM)

  const origLat = project.center_lat ?? DEFAULT_LAT
  const origLng = project.center_lng ?? DEFAULT_LNG
  const origZoom = project.default_zoom ?? DEFAULT_ZOOM
  const isDirty = lat !== origLat || lng !== origLng || zoom !== origZoom

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const initLat = project.center_lat ?? DEFAULT_LAT
      const initLng = project.center_lng ?? DEFAULT_LNG
      const initZoom = project.default_zoom ?? DEFAULT_ZOOM

      const map = L.map(containerRef.current!).setView([initLat, initLng], initZoom)
      mapRef.current = map

      const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY
      L.tileLayer(
        `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png${stadiaKey ? `?api_key=${stadiaKey}` : ''}`,
        {
          attribution:
            '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 20,
        },
      ).addTo(map)

      const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setLat(Math.round(pos.lat * 1e6) / 1e6)
        setLng(Math.round(pos.lng * 1e6) / 1e6)
      })

      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng
        const roundedLat = Math.round(clickLat * 1e6) / 1e6
        const roundedLng = Math.round(clickLng * 1e6) / 1e6
        marker.setLatLng([roundedLat, roundedLng])
        setLat(roundedLat)
        setLng(roundedLng)
      })

      map.on('zoomend', () => {
        setZoom(map.getZoom())
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    const updates: UpdateProjectDTO = {
      center_lat: lat,
      center_lng: lng,
      default_zoom: zoom,
    }
    try {
      await updateProject.mutateAsync({ projectId: project.id, updates })
      showToast('Map location saved', 'success')
    } catch {
      showToast('Failed to save map location', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-400 m-0">
        Click on the map to set the default center point, or drag the marker. Zoom in/out to set the default zoom level.
      </p>

      {/* Map */}
      <div
        ref={containerRef}
        style={{ height: 380, borderRadius: 8, border: '1px solid #334155' }}
      />

      {/* Coordinate readout */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>Lat: <span className="text-slate-200 font-mono">{lat.toFixed(6)}</span></span>
        <span>Lng: <span className="text-slate-200 font-mono">{lng.toFixed(6)}</span></span>
        <span>Zoom: <span className="text-slate-200 font-mono">{zoom}</span></span>
      </div>

      <button
        onClick={handleSave}
        disabled={!isDirty || updateProject.isPending}
        className="self-start px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updateProject.isPending ? 'Saving…' : 'Save Location'}
      </button>
    </div>
  )
}
