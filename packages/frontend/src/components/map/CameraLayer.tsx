/**
 * CameraLayer — renders placed camera markers on the Leaflet map and handles
 * map-click events when the "place-camera" tool is active.
 *
 * Renders no DOM of its own; all output goes directly into the Leaflet map.
 */
import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker, LeafletMouseEvent } from 'leaflet'
import {
  useCameraInstances,
  useCreateCameraInstance,
} from '../../api/cameraInstances'
import { useMapViewStore } from '../../store/mapViewSlice'

// ── Marker icon ────────────────────────────────────────────────────────────────

function buildCameraIcon(colour: string, selected: boolean): string {
  const ring = selected ? `box-shadow:0 0 0 2px #fff,0 0 0 4px ${colour};` : ''
  return `
    <div style="
      width:28px;height:28px;border-radius:50%;
      background:${colour};
      display:flex;align-items:center;justify-content:center;
      ${ring}
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="14" height="10" rx="2" stroke="white" stroke-width="2"/>
        <path d="M16 10l5-3v10l-5-3V10z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="9" cy="12" r="2" stroke="white" stroke-width="2"/>
      </svg>
    </div>
  `
}

// ── Component ──────────────────────────────────────────────────────────────────

interface CameraLayerProps {
  projectId: string
  map: LeafletMap | null
}

export default function CameraLayer({ projectId, map }: CameraLayerProps) {
  const { data: cameras } = useCameraInstances(projectId)
  const createCamera = useCreateCameraInstance(projectId)

  const activeTool = useMapViewStore((s) => s.activeTool)
  const selectedModelId = useMapViewStore((s) => s.selectedModelId)
  const selectedCameraId = useMapViewStore((s) => s.selectedCameraId)
  const setSelectedCamera = useMapViewStore((s) => s.setSelectedCamera)
  const selectCameraAfterPlacement = useMapViewStore((s) => s.selectCameraAfterPlacement)

  const markersRef = useRef<Map<string, Marker>>(new Map())

  // ── Sync markers with camera list ──────────────────────────────────────────
  useEffect(() => {
    if (!map || !cameras) return

    import('leaflet').then((L) => {
      const existing = markersRef.current
      const currentIds = new Set(cameras.map((c) => c.id))

      // Remove stale markers
      for (const [id, marker] of existing) {
        if (!currentIds.has(id)) {
          marker.remove()
          existing.delete(id)
        }
      }

      // Add or update markers
      for (const cam of cameras) {
        const isSelected = cam.id === selectedCameraId

        if (existing.has(cam.id)) {
          // Update icon if selection changed
          const marker = existing.get(cam.id)!
          marker.setIcon(
            L.divIcon({
              html: buildCameraIcon(cam.colour, isSelected),
              className: '',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
          )
        } else {
          // Create new marker
          const marker = L.marker([cam.lat, cam.lng], {
            icon: L.divIcon({
              html: buildCameraIcon(cam.colour, isSelected),
              className: '',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
          }).addTo(map)

          marker.on('click', (e: LeafletMouseEvent) => {
            // Prevent the map click from firing when clicking a marker
            e.originalEvent.stopPropagation()
            setSelectedCamera(cam.id === selectedCameraId ? null : cam.id)
          })

          existing.set(cam.id, marker)
        }
      }
    })
  }, [cameras, map, selectedCameraId, setSelectedCamera])

  // ── Clean up all markers on unmount ───────────────────────────────────────
  useEffect(() => {
    const markers = markersRef.current
    return () => {
      for (const marker of markers.values()) {
        marker.remove()
      }
      markers.clear()
    }
  }, [])

  // ── Map click handler for camera placement ────────────────────────────────
  useEffect(() => {
    if (!map || activeTool !== 'place-camera' || !selectedModelId) return

    const handler = (e: LeafletMouseEvent) => {
      createCamera.mutate(
        { camera_model_id: selectedModelId, lat: e.latlng.lat, lng: e.latlng.lng },
        { onSuccess: (newCamera) => selectCameraAfterPlacement(newCamera.id) },
      )
    }

    map.on('click', handler)
    return () => {
      map.off('click', handler)
    }
  }, [map, activeTool, selectedModelId, createCamera, selectCameraAfterPlacement])

  return null
}
