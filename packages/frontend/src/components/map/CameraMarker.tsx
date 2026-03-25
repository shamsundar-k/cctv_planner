/**
 * CameraMarker — manages one Leaflet marker for one camera.
 *
 * Subscribes to `cameraInstances[cameraId]` in the Zustand store so it only
 * re-renders when *this* camera's data changes.  Other cameras' updates are
 * completely invisible to this component.
 */
import { useEffect, useRef } from 'react'
import type { Marker, LeafletMouseEvent } from 'leaflet'
import { useCameraInstanceStore } from '../../store/cameraInstanceStore'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import { useCameraLayer } from './MapContext'

// ── Icon builder (same visual as before) ──────────────────────────────────────

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

interface CameraMarkerProps {
  cameraId: string
}

export default function CameraMarker({ cameraId }: CameraMarkerProps) {
  const camera = useCameraInstanceStore((s) => s.cameraInstances[cameraId])
  const selectedCameraId = useCameraLayerStore((s) => s.selectedCameraId)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const cameraLayer = useCameraLayer()

  const markerRef = useRef<Marker | null>(null)
  // Keep selectedCameraId in a ref so the click handler never goes stale
  // without needing to recreate the marker.
  const selectedCameraIdRef = useRef(selectedCameraId)
  useEffect(() => { selectedCameraIdRef.current = selectedCameraId }, [selectedCameraId])


  // ── Create marker on mount, remove on unmount ────────────────────────────
  useEffect(() => {
    if (!cameraLayer || !camera) return

    let mounted = true
    import('leaflet').then((L) => {
      if (!mounted || markerRef.current) return

      const marker = L.marker([camera.lat, camera.lng], {
        icon: L.divIcon({
          html: buildCameraIcon(camera.colour, camera.id === selectedCameraIdRef.current),
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(cameraLayer)

      marker.on('click', (e: LeafletMouseEvent) => {
        e.originalEvent.stopPropagation()
        const currentSelected = selectedCameraIdRef.current
        selectCamera(cameraId === currentSelected ? null : cameraId)
      })

      markerRef.current = marker
    })

    return () => {
      mounted = false
      markerRef.current?.remove()
      markerRef.current = null
    }
  // Only run on mount/unmount — position and icon updates are handled separately
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraLayer])

  // ── Update icon when colour or selection state changes ───────────────────
  useEffect(() => {
    if (!camera || !markerRef.current) return
    import('leaflet').then((L) => {
      markerRef.current?.setIcon(
        L.divIcon({
          html: buildCameraIcon(camera.colour, camera.id === selectedCameraId),
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      )
    })
  }, [camera?.colour, selectedCameraId, camera?.id])


  // ── Update position when lat/lng changes ────────────────────────────────
  useEffect(() => {
    if (camera && markerRef.current) {
      markerRef.current.setLatLng([camera.lat, camera.lng])
    }
  }, [camera?.lat, camera?.lng])

  return null
}
