/**
 * CameraMarker — manages one Leaflet marker for one camera.
 *
 * Subscribes to `cameraRecords[cameraId].camera` in the Zustand store so it only
 * re-renders when *this* camera's data changes.
 */
import { useEffect, useRef } from 'react'
import type { Marker, LeafletMouseEvent, LayerGroup } from 'leaflet'
import { useCameraInstanceStore } from '../../../../store/cameraInstanceStore'
import { useCameraLayerStore } from '../../../../store/cameraLayerSlice'

function buildCameraIcon(colour: string, selected: boolean, bearing: number): string {
  const selectionRing = selected
    ? `<circle cx="16" cy="24" r="14" fill="none" stroke="white" stroke-width="2.5"/>`
    : ''
  return `
    <div style="width:32px;height:40px;transform:rotate(${bearing}deg);transform-origin:16px 24px;">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <polygon points="16,2 11,14 21,14" fill="${colour}"/>
        ${selectionRing}
        <circle cx="16" cy="24" r="13" fill="${colour}"/>
        <g transform="translate(8.5,18)">
          <rect x="0" y="2" width="10" height="7" rx="1.5" stroke="white" stroke-width="1.5"/>
          <path d="M10 4l3.5-2v7L10 7V4z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="5" cy="5.5" r="1.5" stroke="white" stroke-width="1.5"/>
        </g>
      </svg>
    </div>
  `
}

interface CameraMarkerProps {
  cameraId: string
  layer: LayerGroup | null
}

export default function CameraMarker({ cameraId, layer }: CameraMarkerProps) {
  const camera = useCameraInstanceStore((s) => s.cameraRecords[cameraId]?.camera)
  const selectedCameraId = useCameraLayerStore((s) => s.selectedCameraId)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)

  const markerRef = useRef<Marker | null>(null)
  const selectedCameraIdRef = useRef(selectedCameraId)
  useEffect(() => { selectedCameraIdRef.current = selectedCameraId }, [selectedCameraId])

  useEffect(() => {
    if (!layer || !camera) return

    let mounted = true
    import('leaflet').then((L) => {
      if (!mounted || markerRef.current) return

      const marker = L.marker([camera.lat, camera.lng], {
        icon: L.divIcon({
          html: buildCameraIcon(camera.colour, cameraId === selectedCameraIdRef.current, camera.bearing),
          className: '',
          iconSize: [32, 40],
          iconAnchor: [16, 24],
        }),
      }).addTo(layer)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer])

  useEffect(() => {
    if (!camera || !markerRef.current) return
    import('leaflet').then((L) => {
      markerRef.current?.setIcon(
        L.divIcon({
          html: buildCameraIcon(camera.colour, cameraId === selectedCameraId, camera.bearing),
          className: '',
          iconSize: [32, 40],
          iconAnchor: [16, 24],
        }),
      )
    })
  }, [camera?.colour, camera?.bearing, selectedCameraId, cameraId])

  useEffect(() => {
    if (camera && markerRef.current) {
      markerRef.current.setLatLng([camera.lat, camera.lng])
    }
  }, [camera?.lat, camera?.lng])

  return null
}
