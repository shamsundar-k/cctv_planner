/*
 * FILE SUMMARY — src/features/project-manage/components/MapLocationTab.tsx
 *
 * "Map Location" tab in the Project Settings page. Provides an interactive
 * Leaflet map for setting the project's default centre point and zoom level.
 *
 * MapLocationTab({ project }) — Renders:
 *   - A short instruction paragraph.
 *   - An interactive Leaflet map (380 px tall) initialised at the project's
 *     stored coordinates or default Bangalore coordinates (12.9716, 77.5946).
 *   - A draggable marker that the user can reposition. Clicking anywhere on
 *     the map also moves the marker to that point.
 *   - A coordinate and zoom readout showing the current lat/lng/zoom values.
 *   - A "Save Location" button, enabled only when the values differ from the
 *     saved project values (`isDirty` is true).
 *
 * Leaflet is dynamically imported inside a useEffect to avoid SSR issues.
 * Marker icon URLs are patched to use unpkg CDN assets (Leaflet default icon
 * workaround for bundler environments). Map and marker refs are cleaned up on
 * component unmount to prevent memory leaks.
 *
 * handleSave() — Calls the useUpdateProject mutation with the current lat,
 *   lng, and zoom values. Shows a success or error toast.
 */
import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import type { Project, UpdateProjectDTO } from '../../../api/projects.types'
import { useUpdateProject } from '../../../api/projects'
import { useToast } from '../../../components/ui/Toast'

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
      <p className="text-sm text-muted m-0">
        Click on the map to set the default center point, or drag the marker. Zoom in/out to set the default zoom level.
      </p>

      {/* Map */}
      <div
        ref={containerRef}
        style={{ height: 380, borderRadius: 8, border: '1px solid var(--color-border)' }}
      />

      {/* Coordinate readout */}
      <div className="flex items-center gap-4 text-sm text-muted">
        <span>Lat: <span className="text-primary font-mono">{lat.toFixed(6)}</span></span>
        <span>Lng: <span className="text-primary font-mono">{lng.toFixed(6)}</span></span>
        <span>Zoom: <span className="text-primary font-mono">{zoom}</span></span>
      </div>

      <button
        onClick={handleSave}
        disabled={!isDirty || updateProject.isPending}
        className="self-start px-5 py-2 text-sm font-semibold bg-accent hover:bg-accent-hover text-on-accent rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updateProject.isPending ? 'Saving…' : 'Save Location'}
      </button>
    </div>
  )
}
